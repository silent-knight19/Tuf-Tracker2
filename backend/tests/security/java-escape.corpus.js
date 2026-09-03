/**
 * S5 — Java escape corpus (data only; never auto-executed).
 *
 * Each entry is a hostile-workload probe with an HONEST containment verdict
 * against the current implementation. Entries marked RESIDUAL prove, by
 * construction, why platform isolation (S17) is still required — they must
 * not be edited to claim containment they don't have.
 *
 * Live execution: `RUN_ESCAPE_CORPUS=1 node tests/security/run-escape-corpus.js`
 * (operator-gated; refuses otherwise). S19 absorbs this corpus into the
 * permanent attack suite.
 */

const corpus = [
  {
    id: 'ENV-01',
    category: 'secret-discovery',
    title: 'Environment discovery via System.getenv',
    verdict: 'PARTIAL',
    note: 'Contained only in the sense that the child env is minimal (PATH, JAVA_HOME, TMPDIR, LANG). getenv() itself works.',
    code: `public class Main {
  public static void main(String[] args) {
    System.getenv().forEach((k, v) -> System.out.println(k + "=" + v));
    System.out.println("user.dir=" + System.getProperty("user.dir"));
    System.out.println("java.io.tmpdir=" + System.getProperty("java.io.tmpdir"));
  }
}`,
  },
  {
    id: 'FS-READ-01',
    category: 'filesystem-escape',
    title: 'Read host file (/etc/hostname)',
    verdict: 'RESIDUAL',
    note: 'Succeeds pre-S17: same container filesystem, no read-only rootfs.',
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    System.out.println(new String(java.nio.file.Files.readAllBytes(java.nio.file.Paths.get("/etc/hostname"))));
  }
}`,
  },
  {
    id: 'FS-WRITE-01',
    category: 'filesystem-escape',
    title: 'Write outside the sandbox (/tmp/escape-probe)',
    verdict: 'RESIDUAL',
    note: 'Succeeds pre-S17 for absolute paths. Relative paths stay in the sandbox via cwd+user.dir. Live runner removes the probe file.',
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    java.nio.file.Files.write(java.nio.file.Paths.get("/tmp/s5-escape-probe"), "pwn".getBytes());
    System.out.println("wrote-absolute");
    java.nio.file.Files.write(java.nio.file.Paths.get("relative.txt"), "rel".getBytes());
    System.out.println("wrote-relative");
  }
}`,
  },
  {
    id: 'NET-01',
    category: 'network-egress',
    title: 'Outbound socket to link-local metadata IP',
    verdict: 'RESIDUAL',
    note: 'No network namespace pre-S17. Live run uses a fast-failing closed port with a short connect timeout; metadata IP itself is never fetched in tests.',
    code: `public class Main {
  public static void main(String[] args) {
    try {
      java.net.Socket s = new java.net.Socket();
      s.connect(new java.net.InetSocketAddress("127.0.0.1", 9), 1500);
      System.out.println("connected");
      s.close();
    } catch (Exception e) {
      System.out.println("socket-attempted:" + e.getClass().getSimpleName());
    }
  }
}`,
  },
  {
    id: 'PROC-01',
    category: 'process-spawn',
    title: 'Spawn OS process via Runtime.exec',
    verdict: 'RESIDUAL',
    note: 'Works pre-S17: same UID, no PID namespace, no seccomp. Contained only by timeouts.',
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    Process p = Runtime.getRuntime().exec(new String[]{"id"});
    System.out.println(new String(p.getInputStream().readAllBytes()));
  }
}`,
  },
  {
    id: 'LOOP-01',
    category: 'resource-exhaustion',
    title: 'Infinite loop',
    verdict: 'CONTAINED',
    note: 'Kernel timeout(1) on Linux + Node timeout everywhere kill it; result maps to timedOut.',
    code: `public class Main {
  public static void main(String[] args) { long i = 0; while (true) { i++; } }
}`,
  },
  {
    id: 'MEM-01',
    category: 'resource-exhaustion',
    title: 'Heap bomb (unbounded list growth)',
    verdict: 'CONTAINED',
    note: '-Xmx64m forces OutOfMemoryError quickly.',
    code: `public class Main {
  public static void main(String[] args) {
    java.util.List<byte[]> l = new java.util.ArrayList<>();
    while (true) { l.add(new byte[8 * 1024 * 1024]); }
  }
}`,
  },
  {
    id: 'RECUR-01',
    category: 'resource-exhaustion',
    title: 'Deep recursion (stack bomb)',
    verdict: 'CONTAINED',
    note: '-Xss256k converts it to a fast StackOverflowError.',
    code: `public class Main {
  static long f(long n) { return f(n + 1); }
  public static void main(String[] args) { System.out.println(f(0)); }
}`,
  },
  {
    id: 'OUT-01',
    category: 'resource-exhaustion',
    title: 'Output flood (10M lines)',
    verdict: 'CONTAINED',
    note: 'maxBuffer + per-stream truncation cap what the backend retains; process is killed on timeout regardless.',
    code: `public class Main {
  public static void main(String[] args) {
    for (int i = 0; i < 10000000; i++) System.out.println("line-" + i + "-padding-padding-padding");
  }
}`,
  },
  {
    id: 'SYMLINK-01',
    category: 'filesystem-escape',
    title: 'Symlink creation pointing outside the sandbox',
    verdict: 'RESIDUAL',
    note: 'Symlink creation itself is unblocked pre-S17; the link target still resolves outside. Live probe creates the link only (no follow).',
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    java.nio.file.Path link = java.nio.file.Paths.get("escape-link");
    java.nio.file.Path target = java.nio.file.Paths.get("/etc/hostname");
    try {
      java.nio.file.Files.createSymbolicLink(link, target);
      System.out.println("symlink-created");
    } catch (Exception e) {
      System.out.println("symlink-blocked:" + e.getClass().getSimpleName());
    }
  }
}`,
  },
  {
    id: 'TRAVERSE-01',
    category: 'filesystem-escape',
    title: 'Relative parent traversal (..\\..) from the sandbox',
    verdict: 'PARTIAL',
    note: 'cwd+user.dir pin the process in the sandbox, so bare relative writes land inside it (contained). Absolute traversal remains RESIDUAL (see FS-WRITE-01). Live probe writes a relative path only.',
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    java.nio.file.Files.createDirectories(java.nio.file.Paths.get("sub"));
    java.nio.file.Files.write(java.nio.file.Paths.get("sub/../trav.txt"), "t".getBytes());
    System.out.println("relative-write-contained");
  }
}`,
  },
  {
    id: 'CLASSPATH-01',
    category: 'code-execution',
    title: 'Classpath manipulation via user-supplied class files',
    verdict: 'CONTAINED',
    note: 'Only Main.java/Solution.java/input.json are written by the service; the compile allowlist (<=8 .java files) and class cap (<=64) bound smuggled classes. A second public class in one file fails javac.',
    code: `public class Main {
  public static void main(String[] args) { System.out.println("single-main-ok"); }
}`,
  },
  {
    id: 'PROCFS-01',
    category: 'secret-discovery',
    title: 'Read /proc/self/environ and /proc/self/cmdline (Linux)',
    verdict: 'RESIDUAL',
    note: 'Readable pre-S17 (same PID namespace, no read-only mounts). Child env is minimal so environ leaks little, but cmdline confirms co-location. Live probe is read-only and prints byte counts, not content.',
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    for (String f : new String[]{"/proc/self/environ", "/proc/self/cmdline"}) {
      try {
        byte[] b = java.nio.file.Files.readAllBytes(java.nio.file.Paths.get(f));
        System.out.println(f + ":readable:" + b.length);
      } catch (Exception e) {
        System.out.println(f + ":blocked:" + e.getClass().getSimpleName());
      }
    }
  }
}`,
  },
  {
    id: 'DNS-01',
    category: 'network-egress',
    title: 'DNS resolution of internal names',
    verdict: 'RESIDUAL',
    note: 'Resolution works pre-S17 (no DNS filtering); the S13 policy constrains server-side fetches, not JVM DNS. Live probe resolves localhost only.',
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    java.net.InetAddress[] addrs = java.net.InetAddress.getAllByName("localhost");
    System.out.println("resolved:" + addrs.length);
  }
}`,
  },
  {
    id: 'THREAD-01',
    category: 'resource-exhaustion',
    title: 'Thread storm (200 spinning threads)',
    verdict: 'PARTIAL',
    note: 'No thread/PID cap pre-S17 (ulimit -u died with the shell; prlimit unavailable). Bounded only by timeouts + heap. S6/S17 must add hard caps.',
    code: `public class Main {
  public static void main(String[] args) throws Exception {
    for (int i = 0; i < 200; i++) {
      Thread t = new Thread(() -> { long x = 0; while (true) { x++; } });
      t.setDaemon(true);
      t.start();
    }
    Thread.sleep(30000);
  }
}`,
  },
];

module.exports = { corpus };
