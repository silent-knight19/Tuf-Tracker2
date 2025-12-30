const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const codeRunnerService = require('../services/codeRunner.service');
const { verifyToken } = require('./auth.routes');

// GET /api/run/status
// Check if Java is available (diagnostic endpoint)
router.get('/status', async (req, res) => {
  try {
    const checkCommand = (cmd) => new Promise((resolve) => {
      exec(cmd, { timeout: 5000 }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          output: stdout || stderr,
          error: error?.message
        });
      });
    });

    const [javaResult, javacResult] = await Promise.all([
      checkCommand('java -version'),
      checkCommand('javac -version')
    ]);

    res.json({
      status: javaResult.success && javacResult.success ? 'OK' : 'JAVA_NOT_AVAILABLE',
      java: javaResult,
      javac: javacResult,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: error.message
    });
  }
});

// GET /api/run/test
// Comprehensive diagnostic for Java execution
router.get('/test', async (req, res) => {
  const fs = require('fs').promises;
  const path = require('path');
  const os = require('os');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    steps: []
  };
  
  let tempDir = null;
  
  try {
    // Step 1: Check temp dir
    const tmpBase = os.tmpdir();
    diagnostics.steps.push({ step: 'tmpdir', path: tmpBase });
    
    // Step 2: Create temp directory
    tempDir = await fs.mkdtemp(path.join(tmpBase, 'test-'));
    diagnostics.steps.push({ step: 'mkdtemp', path: tempDir, success: true });
    
    // Step 3: Write a simple Java file
    const javaCode = `public class Test {
    public static void main(String[] args) {
        System.out.println("SUCCESS");
    }
}`;
    const javaFile = path.join(tempDir, 'Test.java');
    await fs.writeFile(javaFile, javaCode);
    diagnostics.steps.push({ step: 'writeFile', path: javaFile, success: true });
    
    // Step 4: Check file exists
    const stat = await fs.stat(javaFile);
    diagnostics.steps.push({ step: 'statFile', size: stat.size, success: true });
    
    // Step 5: Try javac with full error capture
    try {
      const compileResult = await execAsync('javac Test.java', { 
        cwd: tempDir, 
        timeout: 10000,
        maxBuffer: 1024 * 1024 
      });
      diagnostics.steps.push({ 
        step: 'compile', 
        success: true, 
        stdout: compileResult.stdout,
        stderr: compileResult.stderr 
      });
    } catch (compileError) {
      diagnostics.steps.push({ 
        step: 'compile', 
        success: false, 
        error: compileError.message,
        stderr: compileError.stderr,
        stdout: compileError.stdout,
        code: compileError.code
      });
      throw compileError;
    }
    
    // Step 6: Check if .class file was created
    const classFile = path.join(tempDir, 'Test.class');
    try {
      const classStat = await fs.stat(classFile);
      diagnostics.steps.push({ step: 'classFile', size: classStat.size, success: true });
    } catch (e) {
      diagnostics.steps.push({ step: 'classFile', success: false, error: 'Not found' });
    }
    
    // Step 7: Try running java
    try {
      const runResult = await execAsync('java Test', { 
        cwd: tempDir, 
        timeout: 5000,
        maxBuffer: 1024 * 1024 
      });
      diagnostics.steps.push({ 
        step: 'run', 
        success: true, 
        stdout: runResult.stdout,
        stderr: runResult.stderr 
      });
    } catch (runError) {
      diagnostics.steps.push({ 
        step: 'run', 
        success: false, 
        error: runError.message,
        stderr: runError.stderr,
        stdout: runError.stdout,
        code: runError.code
      });
    }
    
    diagnostics.overall = 'SUCCESS';
    res.json(diagnostics);
    
  } catch (error) {
    diagnostics.overall = 'FAILED';
    diagnostics.finalError = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    };
    res.json(diagnostics);
  } finally {
    // Cleanup
    if (tempDir) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (e) {}
    }
  }
});

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
