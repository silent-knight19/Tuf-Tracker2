# S5 — Code Runner Security (COMPLETE 2026-09-03)

## What changed (all portable, verified on macOS-dev AND Linux-prod paths)

- **Shell eliminated.** `javac`/`java`/`timeout(1)` spawn via `execFile` argv arrays;
  `routes/codeRunner.routes.js:/status` too. A static test fails the build on any
  `bash -c` / `promisify(exec)` return. No user-influenced string is ever
  interpreted: file lists are explicit (`Main.java`/`Solution.java`, no globs),
  `user.dir` travels as one argv element, stdin as a byte buffer.
- **Least-privilege execution context.** Temp dirs `0700` + random names;
  `TMPDIR` points *inside* the sandbox (JVM temp contained + cleaned);
  child env is `{PATH=/usr/bin:/bin, JAVA_HOME?, TMPDIR, LANG, LC_ALL}` —
  backend secrets provably absent (tested with poisoned parent env).
- **JVM budgets:** `-Xmx64m -Xms16m -Xss256k -XX:MaxDirectMemorySize=16m`,
  `-Duser.dir=<sandbox>`. Timeouts: `timeout -k` (Linux) over Node timeouts.
- **Bomb backstops:** `.class` count ≤64 + sandbox bytes ≤10MB post-compile;
  service-level source ≤100KB / stdin ≤256KB (covers direct AI-service callers
  that bypass HTTP validation); per-stream 100KB truncation with flag.
- **Corpus + tooling:** `tests/security/java-escape.corpus.js` (10 probes with
  honest verdicts), operator-gated live runner (`RUN_ESCAPE_CORPUS=1`),
  `tests/coderunner.hardening.test.js` (10 tests), slow loop-kill proof behind
  `RUN_SLOW_TESTS=1`. Suite 96/96 green.

## Live verdicts (executed 2026-09-03, OpenJDK 25, macOS)

| Probe | Result | Verdict |
|-------|--------|---------|
| ENV-01 getenv | minimal env only (`PATH=/usr/bin:/bin`, empty JAVA_HOME, sandbox TMPDIR) | PARTIAL (read works, secrets absent) |
| FS-READ-01 /etc/hostname | `NoSuchFileException` (target absent on macOS — inconclusive locally) | RESIDUAL by construction |
| FS-WRITE-01 absolute /tmp write | **`wrote-absolute` — SUCCEEDS**, probe cleaned | RESIDUAL (proven) |
| NET-01 socket attempt | `ConnectException` — egress attempts work | RESIDUAL (proven) |
| PROC-01 `Runtime.exec(id)` | `uid=501…` — spawn works as process user | RESIDUAL (proven) |
| LOOP-01 infinite loop | killed, `timedOut` | CONTAINED |
| MEM-01 heap bomb | `OutOfMemoryError` via -Xmx | CONTAINED |
| RECUR-01 stack bomb | `StackOverflowError` via -Xss | CONTAINED |
| OUT-01 10M-line flood | `maxBuffer exceeded`, partial retained | CONTAINED |
| THREAD-01 200 threads | killed by timeout only (no hard cap) | PARTIAL |

## Explicitly NOT claimed

This phase does **not** isolate the runner. Proven-residual: absolute-path FS
read/write, network egress, process spawn as the backend UID, no thread/PID cap
(`ulimit -u` died with the shell; `prlimit` unavailable). In production that UID
is **root** and the secrets live in the same container — SEC-07 stays open at
High/Critical until platform isolation lands.

## Target architecture (for S17 / runner-service track)

`runner process → isolated container`: unprivileged USER, no-new-privs, dropped
caps, read-only rootfs + tiny writable scratch, network disabled, seccomp/AppArmor,
PID/mem/CPU/disk cgroup quotas, wall-clock kill, secret-free env — with the S5
argv/timeout/truncation controls retained inside it. Unverifiable in this
environment (no Docker) — deliberately deferred, not silently dropped.

## Hand-off

- Concurrency/queue/per-user budgets → S6 (a parallel bomb volley is still the
  cheapest DoS; single-shot bombs are contained as shown).
- Non-root image, caps, read-only FS, resource declarations, health wiring → S17.
- AI-generated code reaches the runner via validation paths → S7 must treat model
  output as hostile input (it now lands in a shell-free, budgeted executor).
