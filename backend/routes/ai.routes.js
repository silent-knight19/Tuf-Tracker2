const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const cacheService = require('../services/cache.service');
const { verifyToken } = require('./auth.routes');
const { db } = require('../config/firebase.config');


// POST /api/ai/similar-problem
router.post('/similar-problem', verifyToken, async (req, res) => {
  try {
    const { problemId } = req.body;

    if (!problemId) {
      return res.status(400).json({ error: 'Problem ID is required' });
    }

    // Fetch the original problem details
    const problemDoc = await db.collection('revisions').doc(problemId).get();
    
    if (!problemDoc.exists) {
      return res.status(404).json({ error: 'Original problem not found' });
    }

    const problemData = problemDoc.data();
    
    // Generate similar problem
    const aiProblem = await aiService.generateSimilarProblem(
      problemData.problemTitle,
      problemData.difficulty || 'Medium',
      problemData.topics || [],
      problemData.patterns || []
    );

    res.json(aiProblem);

  } catch (error) {
    console.error('Error generating similar problem:', error);
    res.status(500).json({ error: 'Failed to generate similar problem', details: error.message });
  }
});

// POST /api/ai/custom-problem
router.post('/custom-problem', verifyToken, async (req, res) => {
  try {
    const { pattern, topic, difficulty } = req.body;

    if (!difficulty) {
      return res.status(400).json({ error: 'Difficulty is required' });
    }

    const aiProblem = await aiService.generateProblemFromCriteria(
      pattern,
      topic,
      difficulty
    );

    res.json(aiProblem);

  } catch (error) {
    console.error('Error generating custom problem:', error);
    res.status(500).json({ error: 'Failed to generate custom problem', details: error.message });
  }
});

// POST /api/ai/company-problem
router.post('/company-problem', verifyToken, async (req, res) => {
  try {
    const { company, topic, pattern, difficulty } = req.body;

    if (!company || !difficulty) {
      return res.status(400).json({ error: 'Company and Difficulty are required' });
    }

    const aiProblem = await aiService.generateCompanyProblem(
      company,
      topic,
      pattern,
      difficulty
    );

    res.json(aiProblem);

  } catch (error) {
    console.error('Error generating company problem:', error);
    res.status(500).json({ error: 'Failed to generate company problem', details: error.message });
  }
});

// POST /api/ai/problem-help
router.post('/problem-help', verifyToken, async (req, res) => {
  try {
    const { title, description, difficulty, forceRefresh, pattern, examples, constraints, functionSignature, mode, providedSolution, existingEdgeCases } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // ═══════════════════════════════════════════════════════════════
    // FAST PATH: edge_cases_only mode - bypass cache entirely
    // ═══════════════════════════════════════════════════════════════
    if (mode === 'edge_cases_only') {
      console.log('[problem-help] edge_cases_only mode - bypassing cache, using majority voting');
      const edgeCases = await aiService.generateEdgeCasesFromSolution(
        title,
        functionSignature || null,
        constraints || [],
        providedSolution || null,
        description || '', // For majority voting if no solution provided
        difficulty || 'Medium'
      );
      
      // Return only edge cases for this mode
      return res.json({
        hints: [],
        solutions: {},
        edgeCases: edgeCases || []
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // STANDARD PATH: Full problem help with caching
    // ═══════════════════════════════════════════════════════════════
    const patternKey = pattern ? `_${cacheService.normalizeKey(pattern)}` : '';
    const cacheKey = `help_v2_${cacheService.normalizeKey(title)}${patternKey}`;

    if (forceRefresh) {
      try {
        const { db } = require('../config/firebase.config');
        await db.collection('ai_cache_help').doc(cacheKey).delete();
        console.log(`Cache cleared for: ${cacheKey}`);
      } catch (cacheErr) {
        console.warn('Failed to clear cache:', cacheErr);
      }
    }

    const helpData = await cacheService.getCachedOrGenerate(
      'ai_cache_help',
      cacheKey,
      async () => {
        return await aiService.generateProblemHelp(
          title,
          description,
          difficulty || 'Medium',
          pattern || null,
          examples || [],
          constraints || [],
          functionSignature || null,
          'full', // Always use 'full' for the cached path
          null,
          existingEdgeCases || null
        );
      }
    );

    res.json(helpData);

  } catch (error) {
    console.error('Error generating problem help:', error);
    res.status(500).json({ error: 'Failed to generate problem help', details: error.message });
  }
});

// POST /api/ai/problem-description
router.post('/problem-description', verifyToken, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const cacheKey = `desc_${cacheService.normalizeKey(title)}`;

    const problemData = await cacheService.getCachedOrGenerate(
      'ai_cache_descriptions',
      cacheKey,
      async () => {
        return await aiService.generateProblemDescription(title);
      }
    );
    res.json(problemData); // Return full object with title, description, examples, constraints

  } catch (error) {
    console.error('Error generating problem description:', error);
    res.status(500).json({ error: 'Failed to generate problem description', details: error.message });
  }
});

// POST /api/ai/edge-cases
router.post('/edge-cases', verifyToken, async (req, res) => {
  try {
    const { title, description, examples, constraints, functionSignature, providedSolution } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    // If providedSolution is given, use generateProblemHelp with edge_cases_only mode
    // This will compute actual expected outputs by running the solution code
    if (providedSolution) {
      console.log('Edge cases requested with providedSolution - computing expected outputs...');
      const result = await aiService.generateProblemHelp(
        title,
        description || '',
        'Medium', // Default difficulty
        null, // No pattern requirement
        examples || [],
        constraints || [],
        functionSignature || null,
        'edge_cases_only',
        providedSolution
      );
      return res.json(result.edgeCases || []);
    }
    
    // Otherwise, use cached legacy method (returns null expectedOutput)
    const cacheKey = `edgecases_${cacheService.normalizeKey(title)}`;

    const edgeCases = await cacheService.getCachedOrGenerate(
      'ai_cache_edgecases',
      cacheKey,
      async () => {
        return await aiService.generateEdgeCases(
          title, 
          description, 
          examples || [], 
          constraints || [],
          functionSignature
        );
      }
    );
    
    res.json(edgeCases);
  } catch (error) {
    console.error('Error generating edge cases:', error);
    res.status(500).json({ error: error.message || 'Failed to generate edge cases' });
  }
});

// POST /api/ai/learning-notes
router.post('/learning-notes', verifyToken, async (req, res) => {
  try {
    const { pattern, topic, forceRefresh } = req.body;

    if (!pattern && !topic) {
      return res.status(400).json({ error: 'At least one of pattern or topic is required' });
    }

    // Create cache key based on pattern and topic (v2 prefix for new detailed format)
    const cacheKeyParts = [];
    if (pattern) cacheKeyParts.push(`p_${cacheService.normalizeKey(pattern)}`);
    if (topic) cacheKeyParts.push(`t_${cacheService.normalizeKey(topic)}`);
    const cacheKey = `learn_v2_${cacheKeyParts.join('_')}`;

    // If forceRefresh, delete existing cache first
    if (forceRefresh) {
      try {
        const { db } = require('../config/firebase.config');
        await db.collection('ai_cache_learning').doc(cacheKey).delete();
        console.log(`Learning cache cleared for: ${cacheKey}`);
      } catch (cacheErr) {
        console.warn('Failed to clear learning cache:', cacheErr);
      }
    }

    const learningNotes = await cacheService.getCachedOrGenerate(
      'ai_cache_learning',
      cacheKey,
      async () => {
        return await aiService.generateLearningNotes(pattern, topic);
      }
    );

    res.json(learningNotes);

  } catch (error) {
    console.error('Error generating learning notes:', error);
    res.status(500).json({ error: 'Failed to generate learning notes', details: error.message });
  }
});

// ============================================================
// POST /api/ai/test-cases
// Generate 20 high-quality test cases (Cerebras only)
// ============================================================
router.post('/test-cases', verifyToken, async (req, res) => {
  try {
    const { title, description, constraints, functionSignature, forceRefresh } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const cacheKey = `testcases_${cacheService.normalizeKey(title)}`;
    
    // Clear cache if forceRefresh
    if (forceRefresh) {
      try {
        const { db } = require('../config/firebase.config');
        await db.collection('ai_cache_testcases').doc(cacheKey).delete();
        console.log(`Test cases cache cleared for: ${cacheKey}`);
      } catch (e) {
        console.warn('Failed to clear test case cache:', e.message);
      }
    }

    const testCases = await cacheService.getCachedOrGenerate(
      'ai_cache_testcases',
      cacheKey,
      async () => {
        return await aiService.generateTestCases(
          title, 
          description,
          constraints || [],
          functionSignature
        );
      }
    );
    
    res.json(testCases);
  } catch (error) {
    console.error('Error generating test cases:', error);
    res.status(500).json({ error: error.message || 'Failed to generate test cases' });
  }
});

// ============================================================
// POST /api/ai/solution
// Generate hints + solution (Cerebras only) - INDEPENDENT endpoint
// ============================================================
router.post('/solution', verifyToken, async (req, res) => {
  try {
    const { title, description, difficulty, functionSignature, testCases } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const cacheKey = `solution_${cacheService.normalizeKey(title)}`;

    const solutionData = await cacheService.getCachedOrGenerate(
      'ai_cache_solutions',
      cacheKey,
      async () => {
        return await aiService.generateSolutionOnly(
          title, 
          description,
          difficulty || 'Medium',
          functionSignature,
          testCases || []
        );
      }
    );
    
    res.json(solutionData);
  } catch (error) {
    console.error('Error generating solution:', error);
    res.status(500).json({ error: error.message || 'Failed to generate solution' });
  }
});

// ============================================================
// POST /api/ai/analyze-code
// Analyze user's code with comprehensive feedback
// ============================================================
router.post('/analyze-code', verifyToken, async (req, res) => {
  try {
    const { code, problemDescription, examples, constraints, optimalComplexity, executionFeedback } = req.body;
    
    if (!code || !problemDescription) {
      return res.status(400).json({ error: 'Code and problem description are required' });
    }
    
    console.log('📊 Analyzing user code...');
    
    const analysis = await aiService.analyzeUserCode(
      code,
      problemDescription,
      examples || [],
      constraints || [],
      optimalComplexity || null,
      executionFeedback || null // Pass runtime feedback if available
    );
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing code:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze code' });
  }
});

module.exports = router;

