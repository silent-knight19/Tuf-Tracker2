/**
 * CodeRunner Service - Robust Java Code Execution
 * 
 * This service handles Java code compilation and execution with:
 * - Comprehensive error handling at every step
 * - Support for LeetCode-style Solution classes
 * - Proper temp directory management
 * - Strict resource limits (Memory & Time)
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
      // 25s for compile (give it time even with low memory GC pauses)
      compile: 25000,
      run: 10000
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

    try {
      // Step 1: Determine if this is a Solution class that needs wrapping
      const needsWrapper = this.needsSolutionWrapper(source);

      // Step 2: Generate final source code
      let finalSource;
      if (needsWrapper) {
        finalSource = this.createWrappedSource(source, stdin);
        stdin = ''; // Clear stdin since test cases are embedded
      } else {
        finalSource = source;
      }
      
      // Step 3: Create temp directory
      tempDir = await this.createTempDir();
      console.log('[CodeRunner] Temp dir created:', tempDir);

      // Step 4: Write source file
      const sourceFile = path.join(tempDir, 'Main.java');
      await fs.writeFile(sourceFile, finalSource, 'utf8');

      // Step 5: Compile
      const compileResult = await this.compile(tempDir);
      if (!compileResult.success) {
        // Immediate cleanup on error to save space
        await this.cleanup(tempDir);
        tempDir = null;
        
        console.log('[CodeRunner] Compilation failed');
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
      
      const elapsed = Date.now() - startTime;
      console.log('[CodeRunner] Execution complete in', elapsed, 'ms');

      return {
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        exitCode: runResult.exitCode,
        timedOut: runResult.timedOut,
        stage: 'run'
      };

    } catch (error) {
      console.error('[CodeRunner] Unexpected error:', error.message);
      return {
        stdout: '',
        stderr: `Server Error: ${error.message}`,
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

  needsSolutionWrapper(source) {
    return source.includes('class Solution') && !source.includes('public class Main');
  }

  async createTempDir() {
    const prefix = path.join(os.tmpdir(), 'java-');
    return await fs.mkdtemp(prefix);
  }

  async compile(tempDir) {
    try {
      console.log('[CodeRunner] Compiling in:', tempDir);
      
      // CRITICAL MEMORY LIMITS for Render Free Tier (512MB RAM total)
      // WE MUST BE EXTREMELY CONSERVATIVE.
      // -J-Xmx128m: Limit javac heap to 128MB.
      // -J-Xms16m: Start small.
      await execPromise('javac -J-Xmx128m -J-Xms16m -encoding UTF-8 Main.java', {
        cwd: tempDir,
        timeout: this.timeout.compile,
        maxBuffer: this.maxBuffer
      });

      return { success: true };
    } catch (error) {
      let errorMessage = '';

      // Check for timeout explicitly
      if (error.killed && error.signal === 'SIGTERM') {
        return {
          success: false,
          error: "Compilation Timed Out. The server is under heavy load."
        };
      }

      if (error.stderr) errorMessage = error.stderr;
      else if (error.stdout) errorMessage = error.stdout;
      else errorMessage = error.message || 'Unknown compilation error';

      if (error.code) errorMessage = `(Exit Code: ${error.code}) ` + errorMessage;

      // Clean up the error message
      const cleaned = this.cleanErrorMessage(errorMessage, tempDir);
      
      return { 
        success: false, 
        error: cleaned 
      };
    }
  }

  async execute(tempDir, stdin) {
    try {
      console.log('[CodeRunner] Executing in:', tempDir);
      
      // STRICT MEMORY LIMIT:
      // -Xmx64m: Max heap 64MB. Enough for algo problems (arrays of ~10M ints fit), safe for 512MB container.
      const result = await execPromise('java -Xmx64m -Xms16m Main', {
        cwd: tempDir,
        timeout: this.timeout.run,
        maxBuffer: this.maxBuffer,
        env: {
          PATH: process.env.PATH,
          JAVA_HOME: process.env.JAVA_HOME,
          LANG: process.env.LANG
        }
      });

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: 0,
        timedOut: false
      };
    } catch (error) {
      if (error.killed || error.signal === 'SIGTERM') {
        return {
          stdout: error.stdout || '',
          stderr: 'Execution Timed Out (10s limit)',
          exitCode: 1,
          timedOut: true
        };
      }

      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || 'Runtime Error',
        exitCode: error.code || 1,
        timedOut: false
      };
    }
  }

  cleanErrorMessage(message, tempDir) {
    if (!message) return 'Unknown error';
    const escapedPath = tempDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let clean = message.replace(new RegExp(escapedPath + '/?', 'g'), '');
    clean = clean.replace(/Main\.java:/g, 'Line ');
    clean = clean.replace(/\/Main\.java:/g, 'Line ');
    return clean.trim();
  }

  async cleanup(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('[CodeRunner] Cleanup failed:', error.message);
    }
  }

  escapeForJavaString(str) {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  createWrappedSource(solutionCode, testInput) {
    const escapedJson = this.escapeForJavaString(testInput || '');
    const cleanedSolution = solutionCode.replace(/public\s+class\s+Solution/g, 'class Solution');

    return `import java.util.*;
import java.util.concurrent.*;
import java.util.regex.*;
import java.util.stream.*;
import java.util.function.*;
import java.math.*;
import java.text.*;
import java.time.*;
import java.lang.reflect.*;

${cleanedSolution}

public class Main {
    public static void main(String[] args) {
        try {
            String jsonInput = "${escapedJson}";
            
            if (jsonInput.length() < 10 || !jsonInput.contains("method")) {
                System.out.println("No test cases provided.");
                return;
            }
            
            runTests(jsonInput);
        } catch (Exception e) {
            System.err.println("Wrapper Error: " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }

    private static void runTests(String jsonInput) throws Exception {
        // Strip whitespace for robust JSON parsing
        jsonInput = jsonInput.replaceAll("\\\\s+", "");
        
        String quote = String.valueOf('"');
        
        // Parse method name
        String methodKey = quote + "method" + quote + ":" + quote;
        int methodStart = jsonInput.indexOf(methodKey);
        
        if (methodStart == -1) {
            System.err.println("Error: Could not find method name in test input");
            return;
        }
        
        methodStart += methodKey.length();
        int methodEnd = jsonInput.indexOf(quote, methodStart);
        String methodName = jsonInput.substring(methodStart, methodEnd);
        
        // Find method via reflection
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
        
        // Parse args
        int testNum = 1;
        int argsIndex = 0;
        String argsKey = quote + "args" + quote + ":";
        
        while ((argsIndex = jsonInput.indexOf(argsKey, argsIndex)) != -1) {
            try {
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
                Throwable cause = e instanceof InvocationTargetException ? e.getCause() : e;
                System.out.println("Test " + testNum + ": ERROR - " + cause.getClass().getSimpleName());
            }
            
            testNum++;
            argsIndex++;
        }
    }
    
    private static Object[] parseArgs(String argsStr, Class<?>[] paramTypes) throws Exception {
        List<Object> args = new ArrayList<>();
        // Remove outer []
        if (argsStr.length() > 2) {
            argsStr = argsStr.substring(1, argsStr.length() - 1);
        } else {
            return new Object[0];
        }
        
        int depth = 0;
        int start = 0;
        int paramIndex = 0;
        
        for (int i = 0; i <= argsStr.length(); i++) {
            char c = (i < argsStr.length()) ? argsStr.charAt(i) : ',';
            
            if (c == '[') depth++;
            else if (c == ']') depth--;
            else if (c == ',' && depth == 0) {
                if (i > start) {
                    processArg(args, argsStr.substring(start, i), paramTypes, paramIndex++);
                }
                start = i + 1;
            }
        }
        // Last arg
        if (start < argsStr.length()) {
             processArg(args, argsStr.substring(start), paramTypes, paramIndex++);
        }
        
        return args.toArray();
    }

    private static void processArg(List<Object> args, String argStr, Class<?>[] paramTypes, int idx) throws Exception {
        if (argStr.trim().isEmpty() || idx >= paramTypes.length) return;
        args.add(parseValue(argStr, paramTypes[idx]));
    }
    
    private static Object parseValue(String str, Class<?> type) throws Exception {
        str = str.trim();
        if (str.equals("null")) return null;
        
        if (type == int.class || type == Integer.class) return Integer.parseInt(str);
        if (type == long.class || type == Long.class) return Long.parseLong(str);
        if (type == double.class || type == Double.class) return Double.parseDouble(str);
        if (type == boolean.class || type == Boolean.class) return Boolean.parseBoolean(str);
        
        if (type == String.class) {
            if (str.startsWith("\\"") && str.endsWith("\\"")) {
                return str.substring(1, str.length() - 1);
            }
            return str;
        }
        
        if (type == int[].class) return parseIntArray(str);
        if (type == boolean[].class) return parseBooleanArray(str);
        if (type == int[][].class) return parseInt2DArray(str);
        
        return null;
    }
    
    private static int[] parseIntArray(String str) {
        str = str.trim();
        if (str.equals("[]") || str.equals("null")) return new int[0];
        if (str.startsWith("[")) str = str.substring(1, str.length() - 1);
        
        String[] parts = str.split(",");
        int[] result = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            String p = parts[i].trim();
            if (!p.isEmpty()) result[i] = Integer.parseInt(p);
        }
        return result;
    }
    
    private static boolean[] parseBooleanArray(String str) {
        str = str.trim();
        if (str.equals("[]") || str.equals("null")) return new boolean[0];
        if (str.startsWith("[")) str = str.substring(1, str.length() - 1);
        
        String[] parts = str.split(",");
        boolean[] result = new boolean[parts.length];
        for (int i = 0; i < parts.length; i++) {
            String p = parts[i].trim();
            if (!p.isEmpty()) result[i] = Boolean.parseBoolean(p);
        }
        return result;
    }
    
    private static int[][] parseInt2DArray(String str) {
        str = str.trim();
        if (str.equals("[]") || str.equals("null")) return new int[0][];
        if (str.startsWith("[")) str = str.substring(1, str.length() - 1);
        
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
}

module.exports = new CodeRunnerService();
