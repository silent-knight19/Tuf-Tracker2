const express = require('express');
const router = express.Router();
const codeRunnerService = require('../services/codeRunner.service');
const { verifyToken } = require('./auth.routes');

// POST /api/run/java
// Execute Java code with custom input
router.post('/java', verifyToken, async (req, res) => {
  try {
    const { source, stdin, problemId } = req.body;

    // Validate input
    if (!source) {
      return res.status(400).json({ error: 'Source code is required' });
    }

    // Basic validation: check if source is not too large (prevent abuse)
    if (source.length > 100000) { // 100KB limit
      return res.status(400).json({ error: 'Source code is too large (max 100KB)' });
    }

    // Execute the code
    const result = await codeRunnerService.runJava(source, stdin || '');

    // Log execution for debugging (optional)
    console.log(`Code execution for problem ${problemId || 'N/A'} by user ${req.user.uid}`);
    
    res.json(result);

  } catch (error) {
    console.error('Error in code execution endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to execute code', 
      details: error.message 
    });
  }
});

module.exports = router;
