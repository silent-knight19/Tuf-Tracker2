/**
 * Code Runner Routes - API endpoints for Java code execution
 */

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { promisify } = require('util');
const codeRunnerService = require('../services/codeRunner.service');
const { verifyToken } = require('./auth.routes');

const execPromise = promisify(exec);

/**
 * GET /api/run/status
 * Health check endpoint - verifies Java is available
 */
router.get('/status', async (req, res) => {
  try {
    const [javaResult, javacResult] = await Promise.all([
      execPromise('java -version', { timeout: 5000 }).catch(e => ({ stderr: e.stderr || e.message })),
      execPromise('javac -version', { timeout: 5000 }).catch(e => ({ stderr: e.stderr || e.message }))
    ]);

    res.json({
      status: 'OK',
      java: {
        available: !javaResult.error,
        version: (javaResult.stderr || javaResult.stdout || '').split('\n')[0]
      },
      javac: {
        available: !javacResult.error,
        version: (javacResult.stderr || javacResult.stdout || '').split('\n')[0]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

/**
 * GET /api/run/test
 * Test endpoint - runs a simple Java program
 */
router.get('/test', async (req, res) => {
  const simpleCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        System.out.println("Java is working correctly.");
    }
}`;

  try {
    const result = await codeRunnerService.runJava(simpleCode, '');
    res.json({
      message: 'Test execution',
      success: result.exitCode === 0,
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Test failed',
      error: error.message
    });
  }
});

/**
 * GET /api/run/debug
 * Debug endpoint - shows generated Java code for a sample Solution
 */
router.get('/debug', (req, res) => {
  const solutionCode = `class Solution {
    public int add(int a, int b) {
        return a + b;
    }
}`;
  const testInput = JSON.stringify({
    method: "add",
    tests: [
      { args: [1, 2], expected: 3 },
      { args: [5, 5], expected: 10 }
    ]
  });

  const generatedCode = codeRunnerService.wrapSolutionClass(solutionCode, testInput);
  res.type('text/plain').send(generatedCode);
});

/**
 * POST /api/run/java
 * Main endpoint - executes user's Java code
 * Requires authentication
 */
router.post('/java', verifyToken, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { source, stdin, problemId } = req.body;

    // Validate input
    if (!source) {
      return res.status(400).json({ 
        error: 'Source code is required',
        exitCode: 1
      });
    }

    if (source.length > 100000) {
      return res.status(400).json({ 
        error: 'Source code too large (max 100KB)',
        exitCode: 1
      });
    }

    console.log(`[API] Code execution request from user ${req.user?.uid || 'unknown'}`);
    console.log(`[API] Problem: ${problemId || 'N/A'}, Source: ${source.length} bytes, Stdin: ${stdin?.length || 0} bytes`);

    // Execute the code
    const result = await codeRunnerService.runJava(source, stdin || '');

    const elapsed = Date.now() - startTime;
    console.log(`[API] Execution complete in ${elapsed}ms, exitCode: ${result.exitCode}`);

    res.json(result);

  } catch (error) {
    console.error('[API] Error in code execution:', error);
    res.status(500).json({
      stdout: '',
      stderr: `Server error: ${error.message}`,
      exitCode: 1,
      timedOut: false
    });
  }
});

module.exports = router;
