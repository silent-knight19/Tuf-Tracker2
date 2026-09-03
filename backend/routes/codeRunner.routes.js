/**
 * Code Runner Routes - API endpoints for Java code execution
 */

const express = require('express');
const router = express.Router();
// S5: execFile argv only — no shell anywhere on the runner surface.
const { execFile } = require('child_process');
const { promisify } = require('util');
const codeRunnerService = require('../services/codeRunner.service');
const { verifyToken } = require('./auth.routes');
// S2: diagnostics burn CPU / disclose runner internals — authenticated only.
// (No frontend caller uses these; only POST /java is used by the UI.)
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate');
const S = require('../middleware/schemas');
const { limitTier } = require('../middleware/rateLimit');

const execFilePromise = promisify(execFile);

/**
 * GET /api/run/status
 * Health check endpoint - verifies Java is available
 */
router.get('/status', limitTier('public'), async (req, res) => {
  try {
    const [javaResult, javacResult] = await Promise.all([
      execFilePromise('java', ['-version'], { timeout: 5000 }).catch(e => ({ stderr: e.stderr || e.message })),
      execFilePromise('javac', ['-version'], { timeout: 5000 }).catch(e => ({ stderr: e.stderr || e.message }))
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
    // S11: toolchain internals stay server-side.
    res.status(500).json({
      status: 'ERROR',
      error: 'Java toolchain unavailable',
      requestId: req.id || null
    });
  }
});

/**
 * GET /api/run/test
 * Test endpoint - runs a simple Java program
 * S2: authenticated (each call compiles + runs Java).
 */
router.get('/test', authenticate, limitTier('execute'), async (req, res) => {
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
      error: 'Execution failed',
      requestId: req.id || null
    });
  }
});

/**
 * GET /api/run/debug
 * Debug endpoint - shows generated Java code for a sample Solution
 * S2: authenticated (discloses runner internals).
 */
router.get('/debug', authenticate, limitTier('execute'), (req, res) => {
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
router.post('/java', verifyToken, validate(S.codeRunner.run), limitTier('execute'), async (req, res) => {
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

    // S6: principal-keyed admission; saturated pool degrades to 429.
    const result = await codeRunnerService.runJava(source, stdin || '', {
      principal: req.user?.uid || 'anonymous',
    });

    const elapsed = Date.now() - startTime;
    console.log(`[API] Execution complete in ${elapsed}ms, exitCode: ${result.exitCode}`);

    if (result.retryable) {
      res.set('Retry-After', '5');
      try {
        require('../services/securityLog').secEvent('runner.rejected', req, { result: 'deny', reason: 'pool-saturated', retryAfterSec: 5 });
      } catch { /* logging never breaks limiting */ }
      return res.status(429).json(result);
    }

    res.json(result);

  } catch (error) {
    // S11: unexpected failures are generic + correlated; details stay in logs.
    console.error(`[API] Error in code execution (id=${req.id || '-'}):`, error);
    res.status(500).json({
      stdout: '',
      stderr: 'Server error',
      exitCode: 1,
      timedOut: false,
      requestId: req.id || null
    });
  }
});

module.exports = router;
