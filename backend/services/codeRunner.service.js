const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execPromise = promisify(exec);

class CodeRunnerService {
  constructor() {
    this.timeout = {
      compile: 25000,
      run: 10000
    };
    this.maxBuffer = 1024 * 1024;
  }

  async runJava(source, stdin = '') {
    const startTime = Date.now();
    let tempDir = null;
    
    try {
      tempDir = await this.createTempDir();
      const isDirectMain = source.includes('public static void main(String[] args)');

      if (isDirectMain) {
        // Direct Path: Use user's code as Main.java
        await fs.writeFile(path.join(tempDir, 'Main.java'), source, 'utf8');
      } else {
        // Wrapped Path: Use Reflection Runner (Permanent Fix)
        const solutionInfo = this.prepareSolutionFile(source);
        await fs.writeFile(path.join(tempDir, 'Solution.java'), solutionInfo.code, 'utf8');
        await fs.writeFile(path.join(tempDir, 'Main.java'), this.getRunnerCode(), 'utf8');
        await fs.writeFile(path.join(tempDir, 'input.json'), stdin, 'utf8');
        stdin = ''; // JSON data is in input.json now
      }

      // Compile (all .java files in tempDir)
      const compileResult = await this.compile(tempDir, isDirectMain);
      if (!compileResult.success) {
        return {
          stdout: '',
          stderr: compileResult.error,
          exitCode: 1,
          timedOut: false,
          stage: 'compile'
        };
      }

      // Execute
      const runResult = await this.execute(tempDir, stdin, isDirectMain);
      
      return {
        stdout: runResult.stdout,
        stderr: runResult.stderr,
        exitCode: runResult.exitCode,
        timedOut: runResult.timedOut,
        stage: 'run'
      };

    } catch (error) {
      return {
        stdout: '',
        stderr: `Server Error: ${error.message}`,
        exitCode: 1,
        timedOut: false,
        stage: 'error'
      };
    } finally {
      if (tempDir) {
        await this.cleanup(tempDir);
      }
    }
  }

  prepareSolutionFile(source) {
    let code = source.trim();
    
    // Find class name
    const classMatch = code.match(/(?:public\s+)?class\s+(\w+)/);
    if (classMatch) {
      const originalName = classMatch[1];
      if (originalName !== 'Solution') {
        // Rename to Solution so file name 'Solution.java' matches
        code = code.replace(new RegExp(`(?:public\\s+)?class\\s+${originalName}`, 'g'), 'class Solution');
        // Rename constructors
        code = code.replace(new RegExp(`public\\s+${originalName}\\s*\\(`, 'g'), 'public Solution(');
      }
    } else {
      // If it's just a method, wrap it
      if (!code.includes('class Solution')) {
        code = `class Solution {\n${code}\n}`;
      }
    }
    
    return { code };
  }

  async createTempDir() {
    const prefix = path.join(os.tmpdir(), 'java-');
    return await fs.mkdtemp(prefix);
  }

  async compile(tempDir, isDirectMain) {
    try {
      // Compile all java files in the directory
      const cmd = 'javac -J-Xmx128m -J-Xms16m -encoding UTF-8 *.java';
      await execPromise(cmd, {
        cwd: tempDir,
        timeout: this.timeout.compile,
        maxBuffer: this.maxBuffer
      });
      return { success: true };
    } catch (error) {
      let msg = error.stderr || error.stdout || error.message || 'Compilation failed';
      // Clean up error message to hide internal paths
      const escapedPath = tempDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      msg = msg.replace(new RegExp(escapedPath + '/?', 'g'), '');
      return { success: false, error: msg.trim() };
    }
  }

  async execute(tempDir, stdin, isDirectMain) {
    try {
      // If direct main, use stdin. If wrapped, use the input file.
      const cmd = isDirectMain ? 'java -Xmx64m -Xms16m Main' : 'java -Xmx64m -Xms16m Main input.json';
      
      const result = await execPromise(cmd, {
        cwd: tempDir,
        timeout: this.timeout.run,
        maxBuffer: this.maxBuffer,
        env: { ...process.env },
        input: isDirectMain ? stdin : undefined
      });

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: 0,
        timedOut: false
      };
    } catch (error) {
       return {
        stdout: error.stdout || '',
        stderr: error.killed ? 'Execution Timed Out' : (error.stderr || error.message),
        exitCode: error.code || 1,
        timedOut: !!error.killed
      };
    }
  }

  async cleanup(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {}
  }

  getRunnerCode() {
    // Pure Java runner code - No interpolation except for things that are 100% static
    return `
import java.util.*;
import java.io.*;
import java.lang.reflect.*;
import java.nio.file.*;

public class Main {
    public static void main(String[] args) {
        try {
            if (args.length == 0) return;
            
            // 1. Read JSON from file (Permanent fix for escaping)
            String jsonInput = new String(Files.readAllBytes(Paths.get(args[0])));
            
            String methodName = extractJSONValue(jsonInput, "method");
            String testsJSON = extractJSONArray(jsonInput, "tests");
            
            if (methodName == null || testsJSON == null) {
                System.out.println("Error: Could not parse method or tests from input.");
                return;
            }

            // 2. Instantiate User's Class
            Solution sol = new Solution();
            
            // 3. Find target method
            Method target = findMethod(methodName);
            if (target == null) {
                System.out.println("Error: Method not found in Solution class.");
                return;
            }
            target.setAccessible(true);
            
            // 4. Run Tests
            runTests(testsJSON, target, sol);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static Method findMethod(String name) {
        for (Method m : Solution.class.getDeclaredMethods()) {
            if (m.getName().equals(name)) return m;
        }
        // Fallbacks
        String[] fallbacks = {"solve", "processOperations", "minWindowLength", "maxArea", "rangeSum"};
        for (String f : fallbacks) {
            for (Method m : Solution.class.getDeclaredMethods()) {
                if (m.getName().equals(f)) return m;
            }
        }
        return null;
    }

    private static void runTests(String json, Method method, Object instance) {
        int depth = 0;
        int start = -1;
        int count = 1;
        for (int i = 0; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '{') {
                if (depth == 0) start = i;
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0 && start != -1) {
                    runSingle(json.substring(start, i + 1), count++, method, instance);
                    start = -1;
                }
            }
        }
    }

    private static void runSingle(String json, int id, Method method, Object instance) {
        try {
            String argsKey = "\\"args\\":";
            int keyIdx = json.indexOf(argsKey);
            if (keyIdx == -1) return;
            
            int start = json.indexOf("[", keyIdx + argsKey.length());
            int end = -1;
            int depth = 0;
            for (int i = start; i < json.length(); i++) {
                if (json.charAt(i) == '[') depth++;
                else if (json.charAt(i) == ']') depth--;
                if (depth == 0) { end = i + 1; break; }
            }
            
            String argsStr = json.substring(start, end);
            Object[] params = parseArgs(argsStr, method.getParameterTypes());
            Object result = method.invoke(instance, params);
            System.out.println("Test " + id + ": " + format(result));
            
        } catch (InvocationTargetException e) {
            Throwable t = e.getCause();
            System.out.println("Test " + id + ": ERROR - " + (t != null ? t.getClass().getSimpleName() : "Exception"));
        } catch (Exception e) {
            System.out.println("Test " + id + ": ERROR - " + e.getClass().getSimpleName());
        }
    }

    // --- Minimal JSON / Arg Utils ---

    private static String extractJSONValue(String json, String key) {
        int kIdx = json.indexOf("\\"" + key + "\\"");
        if (kIdx == -1) return null;
        int colon = json.indexOf(":", kIdx);
        int s = json.indexOf("\\"", colon + 1);
        int e = json.indexOf("\\"", s + 1);
        return (s != -1 && e != -1) ? json.substring(s + 1, e) : null;
    }

    private static String extractJSONArray(String json, String key) {
        int kIdx = json.indexOf("\\"" + key + "\\"");
        if (kIdx == -1) return null;
        int start = json.indexOf("[", kIdx);
        int depth = 0;
        for (int i = start; i < json.length(); i++) {
            if (json.charAt(i) == '[') depth++;
            else if (json.charAt(i) == ']') depth--;
            if (depth == 0) return json.substring(start, i + 1);
        }
        return null;
    }

    private static Object[] parseArgs(String str, Class<?>[] types) throws Exception {
        String content = str.trim();
        if (content.startsWith("[")) content = content.substring(1, content.length() - 1);
        
        List<Object> list = new ArrayList<>();
        int depth = 0;
        int start = 0;
        int typeIdx = 0;
        
        for (int i = 0; i <= content.length(); i++) {
            char c = (i < content.length()) ? content.charAt(i) : ',';
            if (c == '[' || c == '{') depth++;
            else if (c == ']' || c == '}') depth--;
            else if (c == ',' && depth == 0) {
                String sub = content.substring(start, i).trim();
                if (!sub.isEmpty() && typeIdx < types.length) {
                    list.add(map(sub, types[typeIdx++]));
                }
                start = i + 1;
            }
        }
        return list.toArray();
    }

    private static Object map(String val, Class<?> type) throws Exception {
        val = val.trim();
        if (val.equals("null")) return null;
        
        if (type == int.class || type == Integer.class) return (int)Double.parseDouble(val.replaceAll("[^0-9.-]", ""));
        if (type == long.class || type == Long.class) return (long)Double.parseDouble(val.replaceAll("[^0-9.-]", ""));
        if (type == double.class || type == Double.class) return Double.parseDouble(val.replaceAll("[^0-9.E-]", ""));
        if (type == boolean.class || type == Boolean.class) return Boolean.parseBoolean(val);
        if (type == String.class) {
            String s = val;
            if (s.startsWith("\\\"") && s.endsWith("\\\"")) s = s.substring(1, s.length() - 1);
            return s;
        }
        if (type == int[].class) return toArr(val);
        if (type == int[][].class) return toArr2D(val);
        if (type == String[].class) return toStringArr(val);
        return null;
    }

    private static int[] toArr(String s) {
        String c = s.replace("[", "").replace("]", "").replace(" ", "");
        if (c.isEmpty()) return new int[0];
        String[] p = c.split(",");
        int[] r = new int[p.length];
        for (int i = 0; i < p.length; i++) r[i] = (int)Double.parseDouble(p[i]);
        return r;
    }

    private static int[][] toArr2D(String s) {
        String in = s.trim();
        if (in.startsWith("[")) in = in.substring(1, in.length() - 1);
        List<int[]> l = new ArrayList<>();
        int d = 0, st = -1;
        for (int i = 0; i < in.length(); i++) {
            if (in.charAt(i) == '[') { if (d == 0) st = i; d++; }
            else if (in.charAt(i) == ']') { d--; if (d == 0) l.add(toArr(in.substring(st, i + 1))); }
        }
        return l.toArray(new int[0][]);
    }

    private static String[] toStringArr(String s) {
        String c = s.trim();
        if (c.startsWith("[")) c = c.substring(1, c.length() - 1);
        if (c.isEmpty()) return new String[0];
        String[] p = c.split(",");
        for (int i = 0; i < p.length; i++) {
            String v = p[i].trim();
            if (v.startsWith("\\\"") && v.endsWith("\\\"")) v = v.substring(1, v.length() - 1);
            p[i] = v;
        }
        return p;
    }

    private static String format(Object o) {
        if (o == null) return "null";
        if (o instanceof int[]) return Arrays.toString((int[]) o);
        if (o instanceof int[][]) return Arrays.deepToString((int[][]) o);
        if (o instanceof long[]) return Arrays.toString((long[]) o);
        if (o instanceof String[]) return Arrays.toString((String[]) o);
        return String.valueOf(o);
    }
}
`;
  }
}

module.exports = new CodeRunnerService();
