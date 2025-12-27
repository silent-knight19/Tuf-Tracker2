const express = require('express');
const router = express.Router();
const aiService = require('../services/ai.service');
const cacheService = require('../services/cache.service');
const { verifyToken } = require('./auth.routes');
const { db } = require('../config/firebase.config');

// POST /api/ai/similar-problem
// Generate a new AI problem based on an existing problem ID
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
// Generate a new AI problem based on pattern/topic/difficulty
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
// Generate a new AI problem based on company focus
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
// Generate hints and solutions for a problem
router.post('/problem-help', verifyToken, async (req, res) => {
  try {
    const { title, description, difficulty } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const cacheKey = `help_${cacheService.normalizeKey(title)}`;

    const helpData = await cacheService.getCachedOrGenerate(
      'ai_cache_help',
      cacheKey,
      async () => {
        return await aiService.generateProblemHelp(
          title,
          description,
          difficulty || 'Medium'
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
// Generate problem description from title
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
// Generate edge cases for a problem
router.post('/edge-cases', verifyToken, async (req, res) => { // Changed to verifyToken to match existing import
  try {
    const { title, description, examples, constraints, functionSignature } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
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
// Generate comprehensive learning notes for a pattern/topic
router.post('/learning-notes', verifyToken, async (req, res) => {
  try {
    const { pattern, topic } = req.body;

    if (!pattern && !topic) {
      return res.status(400).json({ error: 'At least one of pattern or topic is required' });
    }

    // Create cache key based on pattern and topic
    const cacheKeyParts = [];
    if (pattern) cacheKeyParts.push(`p_${cacheService.normalizeKey(pattern)}`);
    if (topic) cacheKeyParts.push(`t_${cacheService.normalizeKey(topic)}`);
    const cacheKey = `learn_${cacheKeyParts.join('_')}`;

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

module.exports = router;
