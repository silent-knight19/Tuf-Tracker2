const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase.config');
const { verifyToken } = require('./auth.routes');
const problemAnalyzer = require('../services/problem-analyzer.service');
const revisionService = require('../services/revision.service');
const spacedRepetitionService = require('../services/spaced-repetition.service');
const aiService = require('../services/ai.service');
const cacheService = require('../services/cache.service');
const companyReadiness = require('../services/company-readiness.service');

// GET /api/problems - Get all problems for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { topic, pattern, difficulty, company, topics, patterns } = req.query;
    
    // Create query
    let query = db.collection('problems').where('userId', '==', req.user.uid);

    // Multi-topic support (AND logic)
    const selectedTopics = topics ? topics.split(',').filter(t => t && t !== 'null') : (topic ? [topic] : []);
    const selectedPatterns = patterns ? patterns.split(',').filter(p => p && p !== 'null') : (pattern ? [pattern] : []);

    // Firebase only supports array-contains once, so we'll use it for the first topic if present
    if (selectedTopics.length > 0) {
      query = query.where('topics', 'array-contains', selectedTopics[0]);
    }
    
    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }
    
    // Note: Firebase doesn't support array-contains for multiple arrays simultaneously,
    // so we'll handle additional filtering in memory after fetching.
    
    if (company) {
      query = query.where('companies', 'array-contains', company);
    }

    const snapshot = await query.get();
    
    const problems = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      problems.push({
        id: doc.id,
        ...data
      });
    });

    // Apply AND logic for multiple topics and patterns in memory
    let filteredProblems = problems;

    // Filter by additional topics (if more than 1)
    if (selectedTopics.length > 1) {
      filteredProblems = filteredProblems.filter(p => 
        selectedTopics.every(t => p.topics?.includes(t))
      );
    }

    // Filter by patterns (AND logic)
    if (selectedPatterns.length > 0) {
      filteredProblems = filteredProblems.filter(p => 
        selectedPatterns.every(pat => p.patterns?.includes(pat))
      );
    }

    // Filter by search query (title)
    const { search } = req.query;
    console.log('Backend received search query:', search);
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProblems = filteredProblems.filter(p => 
        p.title.toLowerCase().includes(searchLower)
      );
      console.log('Filtered problems count:', filteredProblems.length);
    }

    res.json({ problems: filteredProblems });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// POST /api/problems - Add a new problem
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, platform, platformUrl, notes, approach, code } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Check for existing problem by URL to avoid duplicates if user clicks twice or on retry
    if (platformUrl) {
      const existingProblem = await db.collection('problems')
        .where('userId', '==', req.user.uid)
        .where('platformUrl', '==', platformUrl)
        .limit(1)
        .get();

      if (!existingProblem.empty) {
        return res.status(200).json({ 
          id: existingProblem.docs[0].id, 
          ...existingProblem.docs[0].data(),
          message: 'Already exists' 
        });
      }
    }

    // Analyze the problem (hybrid: cache -> preloaded -> AI)
    let analysis = await problemAnalyzer.analyzeProblem(
      title,
      platform || 'LeetCode',
      platformUrl || ''
    );

    // Fallback if analysis fails or returns null
    if (!analysis) {
      console.warn(`⚠️ Analysis returned null for "${title}", using fallback values`);
      analysis = {
        title: title,
        platform: platform || 'LeetCode',
        platformUrl: platformUrl || '',
        difficulty: 'Medium',
        topics: [],
        patterns: [],
        companies: [],
        source: 'fallback'
      };
    }

    // Calculate next revision date
    const nextRevision = await revisionService.calculateNextRevision(
      analysis.difficulty || 'Medium',
      0
    );

    // Create problem document
    const problemData = {
      userId: req.user.uid,
      title: title || analysis.title,
      platform: analysis.platform || platform || 'LeetCode',
      platformUrl: analysis.platformUrl || platformUrl || '',
      difficulty: analysis.difficulty || 'Medium',
      topics: analysis.topics || [],
      patterns: analysis.patterns || [],
      companies: analysis.companies || [],
      notes: notes || '',
      approach: approach || '',
      code: code || '',
      solvedAt: new Date(),
      revisionDates: [],
      nextRevision: nextRevision.nextRevisionDate,
      isAIGenerated: analysis.source === 'ai'
,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('problems').add(problemData);

    // Auto-add to revision queue
    try {
      await spacedRepetitionService.addToQueue(
        req.user.uid,
        docRef.id,
        {
          title: title || analysis.title,
          pattern: analysis.patterns?.[0],
          patterns: analysis.patterns || [],
          topics: analysis.topics || [],
          difficulty: analysis.difficulty,
          coreIdea: ''
        },
        db
      );
      console.log(`✅ Auto-added problem ${docRef.id} to revision queue`);
    } catch (err) {
      console.error('Failed to auto-add to revision queue:', err);
      // Don't fail the request, just log
    }

    // Update company database if needed (dynamic learning)
    if (analysis.companies && analysis.companies.length > 0) {
      try {
        await problemAnalyzer.updateCompanyDatabase(analysis.title, analysis.companies);
        // Force reload of company data for UI consistency
        await companyReadiness.loadData(true);
      } catch (err) {
        console.error('Failed to update company database:', err);
      }
    }

    res.status(201).json({
      id: docRef.id,
      ...problemData,
      message: `Problem analyzed using ${analysis.source}`
    });
  } catch (error) {
    console.error('Error adding problem:', error);
    res.status(500).json({ error: 'Failed to add problem' });
  }
});

// GET /api/problems/:id - Get a single problem
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('problems').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    let problem = doc.data();

    // Verify ownership
    if (problem.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Lazy migration: If companies/patterns are missing or outdated, re-analyze and update
    const hasCompanies = problem.companies && problem.companies.length > 0;
    const hasPatterns = problem.patterns && problem.patterns.length > 0;
    const isSortColors = problem.title === 'Sort Colors';
    const missingTwoPointers = isSortColors && !problem.patterns?.includes('Two Pointers');

    if (!hasCompanies || !hasPatterns || missingTwoPointers) {
      try {
        const analysis = await problemAnalyzer.analyzeProblem(
          problem.title,
          problem.platform || 'LeetCode',
          problem.platformUrl || ''
        );

        const updates = {
          companies: analysis.companies || [],
          patterns: analysis.patterns || problem.patterns || [],
          topics: analysis.topics || problem.topics || [],
          updatedAt: new Date()
        };

        // Only update if there are actual changes to avoid unnecessary writes
        const hasChanges = 
          JSON.stringify(updates.companies) !== JSON.stringify(problem.companies) ||
          JSON.stringify(updates.patterns) !== JSON.stringify(problem.patterns);

        if (hasChanges) {
          await db.collection('problems').doc(req.params.id).update(updates);
          problem = { ...problem, ...updates };
          console.log(`🔄 Auto-updated metadata for problem: ${problem.title}`);
        }
      } catch (err) {
        console.error('Error auto-updating problem metadata:', err);
      }
    }

    res.json({ id: doc.id, ...problem });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// PUT /api/problems/:id - Update a problem
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { notes, approach, code, difficulty, topics, patterns, aiNotes } = req.body;

    const doc = await db.collection('problems').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = doc.data();

    if (problem.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updates = {
      updatedAt: new Date()
    };

    if (notes !== undefined) updates.notes = notes;
    if (approach !== undefined) updates.approach = approach;
    if (code !== undefined) updates.code = code;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (topics !== undefined) updates.topics = topics;
    if (patterns !== undefined) updates.patterns = patterns;
    if (aiNotes !== undefined) updates.aiNotes = aiNotes;

    await db.collection('problems').doc(req.params.id).update(updates);

    res.json({ message: 'Problem updated successfully', updates });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
});

// DELETE /api/problems/:id - Delete a problem
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('problems').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = doc.data();

    if (problem.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.collection('problems').doc(req.params.id).delete();

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ error: 'Failed to delete problem' });
  }
});

// POST /api/problems/analyze - Analyze a problem without saving
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { title, platform, platformUrl } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const analysis = await problemAnalyzer.analyzeProblem(
      title,
      platform || 'LeetCode',
      platformUrl || ''
    );

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing problem:', error);
    res.status(500).json({ error: 'Failed to analyze problem' });
  }
});

// POST /api/problems/:id/generate-notes - Generate AI study notes for a problem
router.post('/:id/generate-notes', verifyToken, async (req, res) => {
  try {
    const doc = await db.collection('problems').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const problem = doc.data();

    if (problem.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const aiService = require('../services/ai.service');
    const cacheKey = `notes_v4_${cacheService.normalizeKey(problem.title)}`;
    
    // Check if force refresh is requested
    const forceRefresh = req.body.forceRefresh === true;
    
    // If force refresh, delete old cache first
    if (forceRefresh) {
      await cacheService.deleteCache('ai_cache_notes', cacheKey);
      console.log(`Cache cleared for: ${cacheKey}`);
    }
    
    const notes = await cacheService.getCachedOrGenerate(
      'ai_cache_notes',
      cacheKey,
      async () => {
        return await aiService.generateStudyNotes(
          problem.title,
          problem.platform,
          problem.platformUrl,
          problem.difficulty,
          problem.topics,
          problem.patterns
        );
      }
    );

    res.json({ notes });
  } catch (error) {
    console.error('Error generating notes:', error);
    res.status(500).json({ error: error.message || 'Failed to generate notes' });
  }
});

// POST /api/problems/generate-notes-preview - Generate AI study notes
// SECURED: Requires authentication to protect AI quota
router.post('/generate-notes-preview', verifyToken, async (req, res) => {
  try {
    const { title, platform, platformUrl, difficulty, topics, patterns } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const aiService = require('../services/ai.service');
    const cacheKey = `notes_v4_${cacheService.normalizeKey(title)}`;

    // Check if force refresh is requested
    const forceRefresh = req.body.forceRefresh === true;
    
    // If force refresh, delete old cache first
    if (forceRefresh) {
      await cacheService.deleteCache('ai_cache_notes', cacheKey);
      console.log(`Cache cleared for preview: ${cacheKey}`);
    }

    const notes = await cacheService.getCachedOrGenerate(
      'ai_cache_notes',
      cacheKey,
      async () => {
        return await aiService.generateStudyNotes(
          title,
          platform || 'LeetCode',
          platformUrl || '',
          difficulty || 'Medium',
          topics || [],
          patterns || []
        );
      }
    );

    res.json({ notes });
  } catch (error) {
    console.error('Error generating preview notes:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study notes. Please try again.' });
  }
});

// POST /api/problems/generate-description-preview - Generate description
// SECURED: Requires authentication to protect AI quota
router.post('/generate-description-preview', verifyToken, async (req, res) => {
  try {
    const { title, platform, difficulty, topics, patterns } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const cacheKey = `desc_${cacheService.normalizeKey(title)}`;

    const description = await cacheService.getCachedOrGenerate(
      'ai_cache_descriptions',
      cacheKey,
      async () => {
        return await aiService.generateProblemDescription(
          title,
          platform || 'LeetCode',
          difficulty || 'Medium',
          topics || [],
          patterns || []
        );
      }
    );

    res.json({ description });
  } catch (error) {
    console.error('Error generating preview description:', error);
    res.status(500).json({ error: error.message || 'Failed to generate problem description. Please try again.' });
  }
});

// Generate problem description
router.post('/:id/generate-description', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Try to get the problem from Firestore
    const problemRef = db.collection('users').doc(userId).collection('problems').doc(id);
    const problemDoc = await problemRef.get();

    let problem;
    let shouldSave = false;

    if (!problemDoc.exists) {
      // If problem doesn't exist in Firestore, use data from request body
      if (!req.body.title) {
        return res.status(404).json({ error: 'Problem not found and no problem data provided' });
      }
      problem = req.body;
      shouldSave = true; // We'll create it after generating description
    } else {
      problem = problemDoc.data();
    }

    const cacheKey = `desc_${cacheService.normalizeKey(problem.title)}`;

    const description = await cacheService.getCachedOrGenerate(
      'ai_cache_descriptions',
      cacheKey,
      async () => {
        return await aiService.generateProblemDescription(
          problem.title,
          problem.platform || 'LeetCode',
          problem.difficulty || 'Medium',
          problem.topics || [],
          problem.patterns || []
        );
      }
    );

    // Update or create problem with description
    if (shouldSave) {
      // Create new problem document with the description
      await problemRef.set({
        ...problem,
        description,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Update existing problem
      await problemRef.update({
        description,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json({ description });
  } catch (error) {
    console.error('Error generating problem description:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
