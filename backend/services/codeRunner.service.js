const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class CodeRunnerService {
  /**
   * Execute Java code with stdin input
   * @param {string} source - Java source code
   * @param {string} stdin - Input for the program
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number, timedOut: boolean}>}
   */
  async runJava(source, stdin = '') {
    let tempDir = null;
    
    try {
      // Detect if this is a LeetCode-style Solution class
      const isSolutionClass = source.includes('class Solution') && !source.includes('public class Main');
      
      let finalSource = source;
      
      if (isSolutionClass) {
        // Auto-wrap Solution class with Main class and test harness
        finalSource = this.wrapSolutionClass(source, stdin);
        // Clear stdin since we're using hardcoded test cases
        stdin = '';
      }
      
      // Create a unique temp directory
      tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tuftracker-java-'));
      const sourceFile = path.join(tempDir, 'Main.java');
      
      // Write source to file
      await fs.writeFile(sourceFile, finalSource, 'utf8');
      
      // Compile the Java code
      const compileResult = await this.executeCommand(
        `javac Main.java`,
        tempDir,
        '',
        5000 // 5 second timeout for compilation
      );
      
      if (compileResult.exitCode !== 0) {
        // Detailed logging for debugging (visible in Render logs)
        console.error('\n=== COMPILATION FAILED ===');
        console.error(`Timestamp: ${new Date().toISOString()}`);
        console.error(`Exit Code: ${compileResult.exitCode}`);
        console.error(`Error: ${compileResult.stderr}`);
        console.error('--- SOURCE CODE (Main.java) ---');
        console.error(finalSource);
        console.error('-------------------------------\n');

        // Compilation failed
        // Clean up the error message to be more user-friendly
        const cleanError = compileResult.stderr
          .replace(new RegExp(tempDir, 'g'), '') // Remove temp paths
          .replace(/\/Main\.java/g, 'Line');     // Simplify filenames

        return {
          stdout: compileResult.stdout,
          stderr: cleanError, // Return the actual compiler error
          exitCode: compileResult.exitCode,
          timedOut: false
        };
      }
      
      // Run the compiled Java program
      const runResult = await this.executeCommand(
        `java Main`,
        tempDir,
        stdin,
        3000 // 3 second timeout for execution
      );
      
      return {
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        exitCode: runResult.exitCode,
        timedOut: runResult.timedOut
      };
      
    } catch (error) {
      console.error('Error running Java code:', error);
      return {
        stdout: '',
        stderr: `Internal error: ${error.message}`,
        exitCode: 1,
        timedOut: false
      };
    } finally {
      // Clean up temp directory
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.error('Failed to cleanup temp directory:', cleanupError);
        }
      }
    }
  }
  
  /**
   * Wrap a Solution class with a Main class and test harness
   * Uses JSON parsing and reflection for robust type handling
   * @private
   */
  wrapSolutionClass(solutionCode, testCasesInput) {
    // More robust JSON escaping
    const jsonEscaped = testCasesInput
      .replace(/\\/g, '\\\\')      // Escape backslashes first
      .replace(/"/g, '\\"')         // Escape quotes
      .replace(/\n/g, '\\n')        // Escape newlines
      .replace(/\r/g, '\\r')        // Escape carriage returns
      .replace(/\t/g, '\\t');       // Escape tabs
    
    // Strip 'public' from class Solution to avoid "class Solution is public, should be declared in a file named Solution.java"
    // Since we wrap it in Main.java, only Main can be public.
    const sanitizedSolutionCode = solutionCode.replace(/public\s+class\s+Solution/g, 'class Solution');

    const wrapper = `
import java.util.*;
import java.lang.reflect.*;

${sanitizedSolutionCode}

public class Main {

    public static void main(String[] args) {
        try {
            String jsonInput = "${jsonEscaped}";
            runTests(jsonInput);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static void runTests(String jsonInput) throws Exception {
        // Parse JSON manually (simple parser for our specific format)
        JSONObject testData = parseJSON(jsonInput);
        String methodName = testData.getString("method");
        JSONArray tests = testData.getArray("tests");
        
        Solution solution = new Solution();
        Method targetMethod = findMethod(solution, methodName);
        
        if (targetMethod == null) {
            System.err.println("Method '" + methodName + "' not found in Solution class");
            return;
        }
        
        Class<?>[] paramTypes = targetMethod.getParameterTypes();
        
        // Run each test
        for (int i = 0; i < tests.size(); i++) {
            JSONObject test = tests.getObject(i);
            JSONArray args = test.getArray("args");
            
            try {
                // Convert args to match method parameter types
                Object[] convertedArgs = new Object[args.size()];
                for (int j = 0; j < args.size(); j++) {
                    convertedArgs[j] = convertToType(args.get(j), paramTypes[j]);
                }
                
                // Invoke method
                Object result = targetMethod.invoke(solution, convertedArgs);
                System.out.println("Test " + (i + 1) + ": " + formatOutput(result));
            } catch (Exception e) {
                System.err.println("Test " + (i + 1) + " failed: " + e.getMessage());
            }
        }
    }
    
    private static Method findMethod(Solution solution, String methodName) {
        for (Method m : Solution.class.getDeclaredMethods()) {
            if (m.getName().equals(methodName)) {
                return m;
            }
        }
        return null;
    }
    
    private static Object convertToType(Object value, Class<?> targetType) throws Exception {
        if (value == null) return null;
        
        // Handle primitive types and wrappers
        if (targetType == int.class || targetType == Integer.class) {
            if (value instanceof Number) {
                return ((Number) value).intValue();
            }
            return Integer.parseInt(value.toString());
        }
        if (targetType == long.class || targetType == Long.class) {
            if (value instanceof Number) {
                return ((Number) value).longValue();
            }
            return Long.parseLong(value.toString());
        }
        if (targetType == double.class || targetType == Double.class) {
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            }
            return Double.parseDouble(value.toString());
        }
        if (targetType == boolean.class || targetType == Boolean.class) {
            return Boolean.parseBoolean(value.toString());
        }
        if (targetType == String.class) {
            return value.toString();
        }
        
        // Handle arrays
        if (targetType.isArray()) {
            List<?> list;
            
            // Convert JSONArray to List
            if (value instanceof JSONArray) {
                JSONArray jarr = (JSONArray) value;
                list = new ArrayList<>();
                for (int i = 0; i < jarr.size(); i++) {
                    ((ArrayList<Object>) list).add(jarr.get(i));
                }
            } else if (value instanceof List) {
                list = (List<?>) value;
            } else {
                throw new IllegalArgumentException("Expected array but got: " + value.getClass());
            }
            
            Class<?> componentType = targetType.getComponentType();
            
            if (componentType == int.class) {
                int[] arr = new int[list.size()];
                for (int i = 0; i < list.size(); i++) {
                    arr[i] = ((Number) list.get(i)).intValue();
                }
                return arr;
            } else if (componentType == long.class) {
                long[] arr = new long[list.size()];
                for (int i = 0; i < list.size(); i++) {
                    arr[i] = ((Number) list.get(i)).longValue();
                }
                return arr;
            } else if (componentType == double.class) {
                double[] arr = new double[list.size()];
                for (int i = 0; i < list.size(); i++) {
                    arr[i] = ((Number) list.get(i)).doubleValue();
                }
                return arr;
            } else if (componentType == String.class) {
                return list.toArray(new String[0]);
            } else if (componentType.isArray()) {
                // 2D arrays
                Object arr = Array.newInstance(componentType, list.size());
                for (int i = 0; i < list.size(); i++) {
                    Array.set(arr, i, convertToType(list.get(i), componentType));
                }
                return arr;
            }
        }
        
        return value;
    }
    
    private static String formatOutput(Object obj) {
        if (obj == null) return "null";
        if (obj.getClass().isArray()) {
            if (obj instanceof int[]) return Arrays.toString((int[]) obj);
            if (obj instanceof long[]) return Arrays.toString((long[]) obj);
            if (obj instanceof double[]) return Arrays.toString((double[]) obj);
            if (obj instanceof boolean[]) return Arrays.toString((boolean[]) obj);
            if (obj instanceof String[]) return Arrays.toString((String[]) obj);
            return Arrays.deepToString((Object[]) obj);
        }
        return obj.toString();
    }
    
    // Simple JSON parser for our specific format
    private static JSONObject parseJSON(String json) throws Exception {
        return new JSONObject(json.trim());
    }
    
    static class JSONObject {
        private Map<String, Object> data = new HashMap<>();
        
        public JSONObject(String json) throws Exception {
            parse(json);
        }
        
        private void parse(String json) throws Exception {
            json = json.trim();
            if (!json.startsWith("{") || !json.endsWith("}")) {
                throw new Exception("Invalid JSON object");
            }
            
            json = json.substring(1, json.length() - 1).trim();
            int depth = 0;
            int start = 0;
            boolean inString = false;
            
            for (int i = 0; i < json.length(); i++) {
                char c = json.charAt(i);
                
                if (c == '"' && (i == 0 || json.charAt(i-1) != '\\\\')) {
                    inString = !inString;
                }
                if (inString) continue;
                
                if (c == '{' || c == '[') depth++;
                if (c == '}' || c == ']') depth--;
                
                if (c == ',' && depth == 0) {
                    parsePair(json.substring(start, i));
                    start = i + 1;
                }
            }
            if (start < json.length()) {
                parsePair(json.substring(start));
            }
        }
        
        private void parsePair(String pair) throws Exception {
            pair = pair.trim();
            int colonIndex = pair.indexOf(':');
            if (colonIndex == -1) return;
            
            String key = pair.substring(0, colonIndex).trim();
            String value = pair.substring(colonIndex + 1).trim();
            
            // Remove quotes from key
            if (key.startsWith("\\"") && key.endsWith("\\"")) {
                key = key.substring(1, key.length() - 1);
            }
            
            data.put(key, parseValue(value));
        }
        
        private Object parseValue(String value) throws Exception {
            value = value.trim();
            
            if (value.equals("null")) return null;
            if (value.equals("true")) return true;
            if (value.equals("false")) return false;
            
            if (value.startsWith("\\"") && value.endsWith("\\"")) {
                return value.substring(1, value.length() - 1)
                    .replace("\\\\\\\\", "\\\\")
                    .replace("\\\\\\"", "\\"");
            }
            
            if (value.startsWith("[")) {
                return new JSONArray(value);
            }
            
            if (value.startsWith("{")) {
                return new JSONObject(value);
            }
            
            // Try parsing as number
            try {
                if (value.contains(".")) {
                    return Double.parseDouble(value);
                } else {
                    long num = Long.parseLong(value);
                    if (num >= Integer.MIN_VALUE && num <= Integer.MAX_VALUE) {
                        return (int) num;
                    }
                    return num;
                }
            } catch (NumberFormatException e) {
                return value;
            }
        }
        
        public String getString(String key) {
            Object val = data.get(key);
            return val == null ? null : val.toString();
        }
        
        public JSONArray getArray(String key) {
            return (JSONArray) data.get(key);
        }
    }
    
    static class JSONArray {
        private List<Object> items = new ArrayList<>();
        
        public JSONArray(String json) throws Exception {
            parse(json);
        }
        
        private void parse(String json) throws Exception {
            json = json.trim();
            if (!json.startsWith("[") || !json.endsWith("]")) {
                throw new Exception("Invalid JSON array");
            }
            
            json = json.substring(1, json.length() - 1).trim();
            if (json.isEmpty()) return;
            
            int depth = 0;
            int start = 0;
            boolean inString = false;
            
            for (int i = 0; i < json.length(); i++) {
                char c = json.charAt(i);
                
                if (c == '"' && (i == 0 || json.charAt(i-1) != '\\\\')) {
                    inString = !inString;
                }
                if (inString) continue;
                
                if (c == '{' || c == '[') depth++;
                if (c == '}' || c == ']') depth--;
                
                if (c == ',' && depth == 0) {
                    items.add(new JSONObject("{}").parseValue(json.substring(start, i)));
                    start = i + 1;
                }
            }
            if (start < json.length()) {
                items.add(new JSONObject("{}").parseValue(json.substring(start)));
            }
        }
        
        public int size() {
            return items.size();
        }
        
        public Object get(int index) {
            Object val = items.get(index);
            return val;
        }
        
        public JSONObject getObject(int index) {
            return (JSONObject) items.get(index);
        }
    }
}
`;
    return wrapper;
  }
  
  /**
   * Generate test case parser based on input format
   * Expected input format (JSON):
   * {
   *   "method": "methodName",
   *   "tests": [
   *     { "args": [...], "expected": ... }
   *   ]
   * }
   * 
   * Or simple format (one test per line):
   * arg1 arg2 arg3
   * @private
   */
  generateTestCaseParser(testCasesInput) {
    if (!testCasesInput || testCasesInput.trim() === '') {
      return `
            // No test cases provided - run a default test if possible
            System.out.println("No test cases provided. Please provide test input.");
            System.out.println("You can use JSON format or simple line-by-line inputs.");
      `;
    }
    
    // Try to parse as JSON first
    try {
      const testData = JSON.parse(testCasesInput);
      
      if (testData.method && testData.tests) {
        // Structured test format
        return this.generateStructuredTests(testData);
      }
    } catch (e) {
      // Not JSON, treat as simple format
    }
    
    // Fallback: simple format (detect common patterns)
    return this.generateSimpleTests(testCasesInput);
  }
  
  /**
   * Generate code for structured JSON test cases
   * @private
   */
  generateStructuredTests(testData) {
    const tests = testData.tests.map((test, index) => {
      // Convert JavaScript args to Java syntax
      const javaArgs = test.args.map(arg => this.convertToJavaSyntax(arg)).join(', ');
      
      return `
            // Test ${index + 1}
            try {
                Object result${index} = callMethod(solution, "${testData.method}", ${javaArgs});
                System.out.println("Test ${index + 1}: " + arrayToString(result${index}));
            } catch (Exception e) {
                System.err.println("Test ${index + 1} failed: " + e.getMessage());
            }
      `;
    }).join('\n');
    
    return tests;
  }
  
  /**
   * Convert JavaScript value to Java syntax
   * @private
   */
  convertToJavaSyntax(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'null';
    
    // Handle arrays
    if (Array.isArray(value)) {
      // Check if it's an array of numbers, strings, etc.
      if (value.length === 0) return 'new int[]{}';
      
      const firstElement = value[0];
      if (typeof firstElement === 'number') {
        // Check if integers or doubles
        const hasDecimals = value.some(v => v % 1 !== 0);
        
        if (hasDecimals) {
          const elements = value.join(', ');
          return `new double[]{${elements}}`;
        } else {
          // Use int for all integers (overflow is allowed for edge case testing)
          const elements = value.join(', ');
          return `new int[]{${elements}}`;
        }
      } else if (typeof firstElement === 'string') {
        const elements = value.map(s => `"${s.replace(/"/g, '\\"')}"`).join(', ');
        return `new String[]{${elements}}`;
      } else if (typeof firstElement === 'boolean') {
        const elements = value.join(', ');
        return `new boolean[]{${elements}}`;
      } else if (Array.isArray(firstElement)) {
        // 2D array
        const rows = value.map(row => {
          const elements = row.join(', ');
          return `{${elements}}`;
        }).join(', ');
        return `new int[][]{ ${rows} }`;
      }
      
      // Default to Object array
      const elements = value.map(v => this.convertToJavaSyntax(v)).join(', ');
      return `new Object[]{${elements}}`;
    }
    
    // Handle strings
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    
    // Handle numbers - cast large integers to int for overflow
    if (typeof value === 'number') {
      const INT_MAX = 2147483647;
      const INT_MIN = -2147483648;
      
      // If number exceeds int range, cast it from long
      if (value > INT_MAX || value < INT_MIN) {
        return `(int)${value}L`;
      }
      return String(value);
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
      return String(value);
    }
    
    // For objects, try to stringify (though this might not work well for Java)
    return JSON.stringify(value);
  }
  
  /**
   * Generate code for simple line-based test input
   * @private
   */
  generateSimpleTests(input) {
    const lines = input.trim().split('\n');
    
    return `
            // Simple test execution
            // Input provided: ${lines.length} line(s)
            Scanner sc = new Scanner(System.in);
            
            // Try to find and invoke the first public method in Solution class
            Method[] methods = Solution.class.getDeclaredMethods();
            Method targetMethod = null;
            for (Method m : methods) {
                if (Modifier.isPublic(m.getModifiers()) && !m.getName().equals("main")) {
                    targetMethod = m;
                    break;
                }
            }
            
            if (targetMethod == null) {
                System.out.println("No public method found in Solution class");
                return;
            }
            
            System.out.println("Testing method: " + targetMethod.getName());
            System.out.println("Please provide input in JSON format or implement custom input parsing.");
            System.out.println("Example JSON format:");
            System.out.println("{");
            System.out.println("  \\"method\\": \\"twoSum\\",");
            System.out.println("  \\"tests\\": [");
            System.out.println("    { \\"args\\": [[2,7,11,15], 9], \\"expected\\": [0,1] }");
            System.out.println("  ]");
            System.out.println("}");
    `;
  }
  
  
  /**
   * Execute a shell command with timeout
   * @private
   */
  executeCommand(command, cwd, stdin, timeout) {
    return new Promise((resolve) => {
      const process = exec(
        command,
        {
          cwd,
          timeout,
          maxBuffer: 1024 * 1024, // 1MB buffer
          killSignal: 'SIGTERM'
        },
        (error, stdout, stderr) => {
          if (error) {
            // Check if it's a timeout
            if (error.killed || error.signal === 'SIGTERM') {
              resolve({
                stdout: stdout || '',
                stderr: stderr || '',
                exitCode: error.code || 1,
                timedOut: true
              });
              return;
            }
            
            // Other errors (compilation errors, runtime errors)
            resolve({
              stdout: stdout || '',
              stderr: stderr || error.message,
              exitCode: error.code || 1,
              timedOut: false
            });
            return;
          }
          
          // Success
          resolve({
            stdout: stdout || '',
            stderr: stderr || '',
            exitCode: 0,
            timedOut: false
          });
        }
      );
      
      // Send stdin if provided
      if (stdin) {
        process.stdin.write(stdin);
        process.stdin.end();
      }
    });
  }
}

module.exports = new CodeRunnerService();
