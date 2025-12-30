/**
 * CodeRunner Service - Robust Java Code Execution
 * 
 * This service handles Java code compilation and execution with:
 * - Comprehensive error handling at every step
 * - Detailed logging for debugging
 * - Support for LeetCode-style Solution classes
 * - Proper temp directory management
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execPromise = promisify(exec);

class CodeRunnerService {
  constructor() {
    this.timeout = {
      compile: 15000,  // 15 seconds for compilation
      run: 5000        // 5 seconds for execution
    };
    this.maxBuffer = 1024 * 1024; // 1MB buffer
  }

  /**
   * Main entry point - Execute Java code
   */
  async runJava(source, stdin = '') {
    const startTime = Date.now();
    let tempDir = null;
    
    console.log('[CodeRunner] Starting Java execution...');
    console.log('[CodeRunner] Source length:', source?.length || 0);
    console.log('[CodeRunner] Stdin length:', stdin?.length || 0);

    try {
      // Step 1: Determine if this is a Solution class that needs wrapping
      const needsWrapper = this.needsSolutionWrapper(source);
      console.log('[CodeRunner] Needs Solution wrapper:', needsWrapper);

      // Step 2: Generate final source code
      let finalSource;
      if (needsWrapper) {
        finalSource = this.createWrappedSource(source, stdin);
        stdin = ''; // Clear stdin since test cases are embedded
      } else {
        finalSource = source;
      }
      
      console.log('[CodeRunner] Final source length:', finalSource.length);

      // Step 3: Create temp directory
      tempDir = await this.createTempDir();
      console.log('[CodeRunner] Temp dir created:', tempDir);

      // Step 4: Write source file
      const sourceFile = path.join(tempDir, 'Main.java');
      await fs.writeFile(sourceFile, finalSource, 'utf8');
      console.log('[CodeRunner] Source file written');

      // Step 5: Compile
      const compileResult = await this.compile(tempDir);
      if (!compileResult.success) {
        console.log('[CodeRunner] Compilation failed:', compileResult.error);
        return {
          stdout: '',
          stderr: compileResult.error,
          exitCode: 1,
          timedOut: false,
          stage: 'compile'
        };
      }
      console.log('[CodeRunner] Compilation successful');

      // Step 6: Execute
      const runResult = await this.execute(tempDir, stdin);
      console.log('[CodeRunner] Execution complete:', {
        exitCode: runResult.exitCode,
        stdoutLen: runResult.stdout?.length,
        stderrLen: runResult.stderr?.length,
        timedOut: runResult.timedOut
      });

      const elapsed = Date.now() - startTime;
      console.log('[CodeRunner] Total time:', elapsed, 'ms');

      return {
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        exitCode: runResult.exitCode,
        timedOut: runResult.timedOut,
        stage: 'run'
      };

    } catch (error) {
      console.error('[CodeRunner] Unexpected error:', error.message);
      console.error('[CodeRunner] Stack:', error.stack);
      return {
        stdout: '',
        stderr: `Internal error: ${error.message}`,
        exitCode: 1,
        timedOut: false,
        stage: 'error'
      };
    } finally {
      // Cleanup temp directory
      if (tempDir) {
        await this.cleanup(tempDir);
      }
    }
  }

  /**
   * Check if source code needs Solution wrapper
   */
  needsSolutionWrapper(source) {
    return source.includes('class Solution') && !source.includes('public class Main');
  }

  /**
   * Create temp directory for compilation
   */
  async createTempDir() {
    const prefix = path.join(os.tmpdir(), 'java-');
    return await fs.mkdtemp(prefix);
  }

  /**
   * Compile Java code
   */
  async compile(tempDir) {
    try {
      console.log('[CodeRunner] Compiling in:', tempDir);
      
      await execPromise('javac Main.java', {
        cwd: tempDir,
        timeout: this.timeout.compile,
        maxBuffer: this.maxBuffer
      });

      return { success: true };
    } catch (error) {
      // Extract the actual compiler error message
      let errorMessage = '';
      
      if (error.stderr) {
        errorMessage = error.stderr;
      } else if (error.stdout) {
        errorMessage = error.stdout;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Unknown compilation error';
      }

      // Log full error for debugging
      console.error('[CodeRunner] Compile error object:', {
        message: error.message,
        stderr: error.stderr?.substring(0, 500),
        stdout: error.stdout?.substring(0, 500),
        code: error.code,
        killed: error.killed,
        signal: error.signal
      });

      // Clean up the error message for display
      const cleanError = this.cleanErrorMessage(errorMessage, tempDir);
      
      return { 
        success: false, 
        error: cleanError 
      };
    }
  }

  /**
   * Execute compiled Java code
   */
  async execute(tempDir, stdin) {
    try {
      console.log('[CodeRunner] Executing in:', tempDir);
      
      const result = await execPromise('java Main', {
        cwd: tempDir,
        timeout: this.timeout.run,
        maxBuffer: this.maxBuffer
      });

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: 0,
        timedOut: false
      };
    } catch (error) {
      // Check for timeout
      if (error.killed || error.signal === 'SIGTERM') {
        console.log('[CodeRunner] Execution timed out');
        return {
          stdout: error.stdout || '',
          stderr: 'Execution timed out (limit: 5 seconds)',
          exitCode: 1,
          timedOut: true
        };
      }

      // Runtime error
      console.error('[CodeRunner] Runtime error:', {
        stderr: error.stderr?.substring(0, 500),
        code: error.code
      });

      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || 'Runtime error',
        exitCode: error.code || 1,
        timedOut: false
      };
    }
  }

  /**
   * Clean error messages for user display
   */
  cleanErrorMessage(message, tempDir) {
    if (!message) return 'Unknown error';
    
    // Remove temp directory paths
    const escapedPath = tempDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let clean = message.replace(new RegExp(escapedPath + '/?', 'g'), '');
    
    // Simplify file references
    clean = clean.replace(/Main\.java:/g, 'Line ');
    clean = clean.replace(/\/Main\.java:/g, 'Line ');
    
    return clean.trim();
  }

  /**
   * Cleanup temp directory
   */
  async cleanup(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log('[CodeRunner] Cleanup complete');
    } catch (error) {
      console.error('[CodeRunner] Cleanup failed:', error.message);
    }
  }

  /**
   * Create wrapped source code for Solution classes
   * Generates a Main class that invokes the Solution methods via reflection
   */
  createWrappedSource(solutionCode, testInput) {
    // Escape the JSON for embedding in Java string
    const escapedJson = this.escapeForJavaString(testInput || '');
    
    // Remove 'public' modifier from Solution class
    const cleanedSolution = solutionCode.replace(/public\s+class\s+Solution/g, 'class Solution');

    return `import java.util.*;
import java.lang.reflect.*;

${cleanedSolution}

public class Main {
    public static void main(String[] args) {
        try {
            String jsonInput = "${escapedJson}";
            
            if (jsonInput.length() < 10 || !jsonInput.contains("method")) {
                System.out.println("No test cases provided.");
                System.out.println("Available methods in Solution:");
                for (Method m : Solution.class.getDeclaredMethods()) {
                    System.out.println("  - " + m.getName());
                }
                return;
            }
            
            runTests(jsonInput);
        } catch (Exception e) {
            System.err.println("Error: " + e.getClass().getSimpleName() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void runTests(String jsonInput) throws Exception {
        // Parse method name
        int methodStart = jsonInput.indexOf("\\"method\\":\\"") + 10;
        int methodEnd = jsonInput.indexOf("\\"", methodStart);
        String methodName = jsonInput.substring(methodStart, methodEnd);
        
        // Find the method
        Solution solution = new Solution();
        Method method = null;
        for (Method m : Solution.class.getDeclaredMethods()) {
            if (m.getName().equals(methodName)) {
                method = m;
                break;
            }
        }
        
        if (method == null) {
            System.err.println("Method not found: " + methodName);
            return;
        }
        
        // Parse and run tests
        int testNum = 1;
        int argsIndex = 0;
        
        while ((argsIndex = jsonInput.indexOf("\\"args\\":", argsIndex)) != -1) {
            try {
                // Find the args array
                int bracketStart = jsonInput.indexOf("[", argsIndex + 7);
                int depth = 1;
                int i = bracketStart + 1;
                
                while (depth > 0 && i < jsonInput.length()) {
                    char c = jsonInput.charAt(i);
                    if (c == '[') depth++;
                    else if (c == ']') depth--;
                    i++;
                }
                
                String argsStr = jsonInput.substring(bracketStart, i);
                Object[] parsedArgs = parseArgs(argsStr, method.getParameterTypes());
                
                Object result = method.invoke(solution, parsedArgs);
                System.out.println("Test " + testNum + ": " + formatResult(result));
                
            } catch (Exception e) {
                System.out.println("Test " + testNum + ": ERROR - " + e.getMessage());
            }
            
            testNum++;
            argsIndex++;
        }
    }
    
    private static Object[] parseArgs(String argsStr, Class<?>[] paramTypes) throws Exception {
        List<Object> args = new ArrayList<>();
        argsStr = argsStr.substring(1, argsStr.length() - 1).trim(); // Remove outer []
        
        int depth = 0;
        int start = 0;
        int paramIndex = 0;
        
        for (int i = 0; i <= argsStr.length(); i++) {
            char c = (i < argsStr.length()) ? argsStr.charAt(i) : ',';
            
            if (c == '[') depth++;
            else if (c == ']') depth--;
            else if (c == ',' && depth == 0) {
                if (i > start) {
                    String argStr = argsStr.substring(start, i).trim();
                    if (!argStr.isEmpty() && paramIndex < paramTypes.length) {
                        args.add(parseValue(argStr, paramTypes[paramIndex]));
                        paramIndex++;
                    }
                }
                start = i + 1;
            }
        }
        
        return args.toArray();
    }
    
    private static Object parseValue(String str, Class<?> type) throws Exception {
        str = str.trim();
        
        if (type == int.class || type == Integer.class) {
            return Integer.parseInt(str);
        }
        if (type == long.class || type == Long.class) {
            return Long.parseLong(str);
        }
        if (type == double.class || type == Double.class) {
            return Double.parseDouble(str);
        }
        if (type == boolean.class || type == Boolean.class) {
            return Boolean.parseBoolean(str);
        }
        if (type == String.class) {
            if (str.startsWith("\\"") && str.endsWith("\\"")) {
                return str.substring(1, str.length() - 1);
            }
            return str;
        }
        if (type == int[].class) {
            return parseIntArray(str);
        }
        if (type == boolean[].class) {
            return parseBooleanArray(str);
        }
        if (type == int[][].class) {
            return parseInt2DArray(str);
        }
        
        return null;
    }
    
    private static int[] parseIntArray(String str) {
        str = str.trim();
        if (str.equals("[]")) return new int[0];
        str = str.substring(1, str.length() - 1);
        String[] parts = str.split(",");
        int[] result = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Integer.parseInt(parts[i].trim());
        }
        return result;
    }
    
    private static boolean[] parseBooleanArray(String str) {
        str = str.trim();
        if (str.equals("[]")) return new boolean[0];
        str = str.substring(1, str.length() - 1);
        String[] parts = str.split(",");
        boolean[] result = new boolean[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Boolean.parseBoolean(parts[i].trim());
        }
        return result;
    }
    
    private static int[][] parseInt2DArray(String str) {
        str = str.trim();
        if (str.equals("[]")) return new int[0][];
        str = str.substring(1, str.length() - 1);
        List<int[]> rows = new ArrayList<>();
        
        int depth = 0;
        int start = 0;
        for (int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if (c == '[') {
                if (depth == 0) start = i;
                depth++;
            } else if (c == ']') {
                depth--;
                if (depth == 0) {
                    rows.add(parseIntArray(str.substring(start, i + 1)));
                }
            }
        }
        
        return rows.toArray(new int[0][]);
    }
    
    private static String formatResult(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof int[]) return Arrays.toString((int[]) obj);
        if (obj instanceof long[]) return Arrays.toString((long[]) obj);
        if (obj instanceof double[]) return Arrays.toString((double[]) obj);
        if (obj instanceof boolean[]) return Arrays.toString((boolean[]) obj);
        if (obj instanceof Object[]) return Arrays.deepToString((Object[]) obj);
        return obj.toString();
    }
}`;
  }

  /**
   * Escape a string for embedding in a Java string literal
   */
  escapeForJavaString(str) {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * Public method to get wrapped source (for debugging)
   */
  wrapSolutionClass(solutionCode, testInput) {
    return this.createWrappedSource(solutionCode, testInput);
  }
}

module.exports = new CodeRunnerService();
