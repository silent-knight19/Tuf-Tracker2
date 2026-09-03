/**
 * S5 — operator-gated live escape-corpus runner.
 *
 *   RUN_ESCAPE_CORPUS=1 node tests/security/run-escape-corpus.js
 *
 * Without the env var it REFUSES (these payloads execute hostile workloads;
 * never in CI by default). Each case runs through the real CodeRunnerService
 * with a per-case wall clock. FS-WRITE-01's absolute probe file is removed
 * afterwards. Destructive bombs (fork/disk) are NOT in the live set — their
 * verdicts are architectural (documented), not demonstrated.
 */

const fs = require('fs').promises;
const { corpus } = require('./java-escape.corpus');

if (process.env.RUN_ESCAPE_CORPUS !== '1') {
  console.log('refusing: set RUN_ESCAPE_CORPUS=1 to execute the hostile corpus (operator only).');
  process.exit(2);
}

// Never demonstrate these live: host-wide impact even with timeouts.
const BLOCKED_LIVE = new Set([]);

async function main() {
  const service = require('../../services/codeRunner.service');
  console.log('case | verdict | exit | timedOut | stdout~');
  for (const c of corpus) {
    if (BLOCKED_LIVE.has(c.id)) {
      console.log(`${c.id} | SKIPPED-LIVE | - | - | ${c.verdict}`);
      continue;
    }
    let result;
    try {
      result = await service.runJava(c.code, '');
    } catch (e) {
      result = { stdout: '', stderr: `harness: ${e.message}`, exitCode: 1, timedOut: false };
    }
    const snap = `${(result.stdout || '').slice(0, 80).replace(/\n/g, '|')}`;
    console.log(`${c.id} | ${c.verdict} | ${result.exitCode} | ${!!result.timedOut} | ${snap}`);
  }
  try { await fs.unlink('/tmp/s5-escape-probe'); } catch { /* absent */ }
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
