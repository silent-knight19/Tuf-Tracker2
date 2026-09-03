/**
 * S5: hostile-workload executor. User Java is untrusted input, not data.
 *
 * Shell elimination: every process is spawned with execFile argv arrays —
 * there is NO shell, so no user-influenced string is ever interpreted
 * (no `bash -c`, no glob expansion, no interpolation). The `timeout(1)`
 * binary (Linux/production) is itself an argv element, not a shell wrapper.
 *
 * Portable controls (verified in CI/dev AND production):
 *  temp dirs 0700 with random names, TMPDIR inside the sandbox, minimal env,
 *  JVM heap/stack/direct-memory caps, user.dir pinned to the sandbox,
 *  explicit .java file lists (no globs), .class count + sandbox size caps,
 *  Node + kernel timeouts, per-stream output truncation, service-level input
 *  caps (internal AI callers bypass HTTP validation).
 *
 * Explicitly NOT provided here (needs platform isolation → S17 + §8 of
 * docs/security/s5-code-runner.md): user/cgroup/network namespaces, seccomp,
 * read-only rootfs, UID separation. This module must never be described as
 * a complete sandbox on its own.
 */
const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execFilePromise = promisify(execFile);
const { runnerPool } = require('./runner.pool');

// Service-level backstops (HTTP validation in S4 is the first gate; AI
// service paths call runJava directly and must hit these).
const MAX_SOURCE_BYTES = 100 * 1024;
const MAX_STDIN_BYTES = 256 * 1024;
const MAX_OUTPUT_BYTES = 100 * 1024;
const MAX_CLASS_FILES = 64;
const MAX_SANDBOX_BYTES = 10 * 1024 * 1024;

class CodeRunnerService {
  constructor() {
    this.timeout = {
      compile: 25000,
      run: 10000
    };
    this.maxBuffer = 1024 * 1024;

    // Platform detection: timeout(1) exists on Linux/production, not macOS.
    this.isLinux = os.platform() === 'linux';

    this.limits = {
      compileTimeoutSeconds: 25,
      runTimeoutSeconds: 10,
      maxClassFiles: MAX_CLASS_FILES,
      maxSandboxBytes: MAX_SANDBOX_BYTES,
    };
  }

  /**
   * Execute hostile Java with admission control.
   * `opts.principal` (token uid for HTTP, 'internal:ai' for AI validation)
   * keys the S6 pool: overload returns a retryable result, never throws.
   */
  async runJava(source, stdin = '', opts = {}) {
    const startTime = Date.now();
    let tempDir = null;
    let slot = null;

    // S6: admission BEFORE any work (compile included). Fail fast when the
    // pool is saturated so a volley degrades to 429s, not to a dead backend.
    try {
      slot = await runnerPool.acquire(opts.principal || 'anonymous');
    } catch (poolError) {
      try {
        require('./securityLog').secEvent('runner.rejected', { principal: opts.principal || 'anonymous' }, { result: 'deny', reason: 'pool-saturated' });
      } catch { /* logging never breaks execution */ }
      return {
        stdout: '',
        stderr: 'Server busy: too many concurrent executions. Try again shortly.',
        exitCode: 1,
        timedOut: false,
        stage: 'queued',
        retryable: true
      };
    }

    try {
      // Service-level backstops for direct (non-HTTP) callers.
      if (Buffer.byteLength(source || '', 'utf8') > MAX_SOURCE_BYTES) {
        try {
          require('./securityLog').secEvent('runner.rejected', { principal: opts.principal || 'anonymous' }, { result: 'deny', reason: 'source-cap' });
        } catch { /* logging never breaks execution */ }
        throw new Error('Source code too large');
      }
      if (Buffer.byteLength(stdin || '', 'utf8') > MAX_STDIN_BYTES) {
        try {
          require('./securityLog').secEvent('runner.rejected', { principal: opts.principal || 'anonymous' }, { result: 'deny', reason: 'input-cap' });
        } catch { /* logging never breaks execution */ }
        throw new Error('Input too large');
      }

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
        truncated: !!runResult.truncated,
        stage: 'run'
      };

    } catch (error) {
      // S11: internal failures are generic to callers; detail goes to
      // scrubbed logs only. (HTTP callers get precise S4 400s first.)
      try {
        const { scrub } = require('../middleware/errors');
        console.error('[runner] internal failure:', JSON.stringify(scrub(error)).slice(0, 500));
      } catch {
        console.error('[runner] internal failure (unloggable)');
      }
      return {
        stdout: '',
        stderr: 'Server error',
        exitCode: 1,
        timedOut: false,
        stage: 'error'
      };
    } finally {
      if (slot) slot.release();
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
    const dir = await fs.mkdtemp(prefix);
    // Owner-only: sibling users/processes on shared /tmp must not list,
    // read, or plant files (classpath poisoning) in our sandbox.
    await fs.chmod(dir, 0o700);
    return dir;
  }

  /**
   * Minimal environment for the child. Secrets are NEVER passed through:
   * the backend process env (Firebase/AI keys) is not inherited.
   * TMPDIR points inside the sandbox so JVM temp files are contained and
   * removed by cleanup().
   */
  getSafeEnv(tempDir) {
    return {
      PATH: '/usr/bin:/bin',
      JAVA_HOME: process.env.JAVA_HOME || '',
      TMPDIR: tempDir,
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8'
    };
  }

  wrapSolutionClass(source, testInput = '') {
    const solutionInfo = this.prepareSolutionFile(source);
    return `// === Solution.java ===\n${solutionInfo.code}\n\n// === Main.java (Reflection Runner) ===\n${this.getRunnerCode()}\n\n// === input.json ===\n${testInput}`;
  }

  /**
   * Build the compile argv. Returns { cmd, args } — never a shell string.
   * On Linux the `timeout(1)` binary provides the kernel-level kill; the
   * Node-level timeout below it is the backstop (and the only one on macOS).
   * Exposed for tests (assert no shell, assert flags).
   */
  buildCompileCommand(javaFiles) {
    const javacArgs = [
      '-J-Xmx128m', '-J-Xms16m', '-encoding', 'UTF-8',
      ...javaFiles,
    ];
    if (this.isLinux) {
      return {
        cmd: 'timeout',
        args: ['-k', '5s', `${this.limits.compileTimeoutSeconds}s`, 'javac', ...javacArgs],
      };
    }
    return { cmd: 'javac', args: javacArgs };
  }

  /**
   * Build the run argv. JVM flags bound the heap, per-thread stack (deep
   * recursion dies fast with StackOverflowError instead of consuming RAM),
   * direct buffers, and pin user.dir to the sandbox so relative file access
   * cannot reach the application tree by accident (absolute paths remain a
   * platform-isolation problem → S17).
   */
  buildRunCommand(tempDir, extraArgs) {
    const javaArgs = [
      '-Xmx64m', '-Xms16m',
      '-Xss256k',
      '-XX:MaxDirectMemorySize=16m',
      `-Duser.dir=${tempDir}`,
      'Main',
      ...extraArgs,
    ];
    if (this.isLinux) {
      return {
        cmd: 'timeout',
        args: ['-k', '3s', `${this.limits.runTimeoutSeconds}s`, 'java', ...javaArgs],
      };
    }
    return { cmd: 'java', args: javaArgs };
  }

  /** Compiler-bomb backstop: cap emitted class count + sandbox footprint. */
  async enforceCompileCaps(tempDir) {
    let classFiles = 0;
    let totalBytes = 0;
    const stack = [tempDir];
    while (stack.length > 0) {
      const dir = stack.pop();
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          stack.push(full);
        } else {
          if (item.name.endsWith('.class')) classFiles += 1;
          try {
            totalBytes += (await fs.stat(full)).size;
          } catch {
            // Raced deletion — ignore, cleanup handles it.
          }
        }
      }
    }
    if (classFiles > this.limits.maxClassFiles || totalBytes > this.limits.maxSandboxBytes) {
      throw new Error('Compilation produced too many artifacts');
    }
  }

  /** Truncate a stream to the output budget, flagging truncation. */
  clipOutput(text) {
    const s = text || '';
    if (Buffer.byteLength(s, 'utf8') <= MAX_OUTPUT_BYTES) return { text: s, truncated: false };
    return { text: Buffer.from(s, 'utf8').subarray(0, MAX_OUTPUT_BYTES).toString('utf8'), truncated: true };
  }

  async compile(tempDir, isDirectMain) {
    try {
      // Explicit file list — no glob, no shell. Only files this module wrote
      // can exist here (0700 dir), but never trust the directory listing for
      // anything but .java names we created.
      const items = await fs.readdir(tempDir);
      const javaFiles = items.filter((f) => f.endsWith('.java')).sort();
      if (javaFiles.length === 0 || javaFiles.length > 8) {
        return { success: false, error: 'Unexpected source layout' };
      }

      const { cmd, args } = this.buildCompileCommand(javaFiles);
      await execFilePromise(cmd, args, {
        cwd: tempDir,
        timeout: this.timeout.compile,
        maxBuffer: this.maxBuffer,
        env: this.getSafeEnv(tempDir),
        windowsHide: true,
      });
      await this.enforceCompileCaps(tempDir);
      return { success: true };
    } catch (error) {
      let msg = error.stderr || error.stdout || error.message || 'Compilation failed';
      // Hide internal paths (temp dir name is random per run, still strip it).
      const escapedPath = tempDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      msg = msg.replace(new RegExp(escapedPath + '/?', 'g'), '');
      return { success: false, error: this.clipOutput(msg.trim()).text };
    }
  }

  async execute(tempDir, stdin, isDirectMain) {
    try {
      const extraArgs = isDirectMain ? [] : ['input.json'];
      const { cmd, args } = this.buildRunCommand(tempDir, extraArgs);

      const result = await execFilePromise(cmd, args, {
        cwd: tempDir,
        timeout: this.timeout.run + 2000, // Node timeout slightly longer for safety
        maxBuffer: this.maxBuffer,
        env: this.getSafeEnv(tempDir),
        windowsHide: true,
        input: isDirectMain ? stdin : undefined
      });

      const out = this.clipOutput(result.stdout);
      const err = this.clipOutput(result.stderr);
      return {
        stdout: out.text,
        stderr: err.truncated ? `${err.text}\n[truncated]` : err.text,
        exitCode: 0,
        timedOut: false,
        truncated: out.truncated
      };

    } catch (error) {
      // Exit code 124 = timeout(1) killed the process (Linux only).
      // err.killed = Node-level timeout fired. maxBuffer exceed carries
      // partial stdio on the error object — preserve it, clipped.
      const timedOut = error.killed || error.code === 124;
      const out = this.clipOutput(error.stdout);
      const rawErr = timedOut ? 'Execution Timed Out' : (error.stderr || error.message);
      const err = this.clipOutput(rawErr);
      return {
        stdout: out.text,
        stderr: err.text,
        exitCode: typeof error.code === 'number' ? error.code : 1,
        timedOut
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
            
            // Check if method returns void (for in-place modification problems like Sort Colors)
            boolean isVoid = method.getReturnType() == void.class;
            
            // Store reference to first array param before invocation (for void methods)
            Object firstArrayArg = null;
            if (isVoid && params.length > 0) {
                for (Object p : params) {
                    if (p != null && p.getClass().isArray()) {
                        firstArrayArg = p;
                        break;
                    }
                }
            }
            
            Object result = method.invoke(instance, params);
            
            // For void methods, output the modified first array argument
            if (isVoid && firstArrayArg != null) {
                System.out.println("Test " + id + ": " + format(firstArrayArg));
            } else {
                System.out.println("Test " + id + ": " + format(result));
            }
            
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
        if (type == double[].class) return toDoubleArr(val);
        if (type == long[].class) return toLongArr(val);
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

    private static double[] toDoubleArr(String s) {
        String c = s.replace("[", "").replace("]", "").replace(" ", "");
        if (c.isEmpty()) return new double[0];
        String[] p = c.split(",");
        double[] r = new double[p.length];
        for (int i = 0; i < p.length; i++) r[i] = Double.parseDouble(p[i]);
        return r;
    }

    private static long[] toLongArr(String s) {
        String c = s.replace("[", "").replace("]", "").replace(" ", "");
        if (c.isEmpty()) return new long[0];
        String[] p = c.split(",");
        long[] r = new long[p.length];
        for (int i = 0; i < p.length; i++) r[i] = (long)Double.parseDouble(p[i]);
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

const service = new CodeRunnerService();
// Test-visible budgets (S5/S6 regression surface).
service.constants = {
  MAX_SOURCE_BYTES,
  MAX_STDIN_BYTES,
  MAX_OUTPUT_BYTES,
  MAX_CLASS_FILES,
  MAX_SANDBOX_BYTES,
};
module.exports = service;
