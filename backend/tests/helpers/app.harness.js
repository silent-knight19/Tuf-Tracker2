/**
 * S3 — test harness: Express app wired to an in-memory Firestore.
 *
 * Technique: seed `require.cache` for firebase.config / auth.middleware /
 * ai.service / problem-analyzer.service BEFORE route modules load, so no
 * Firebase, network, or AI call can happen. Each test file runs in its own
 * `node --test` process, so stubbing the require cache here is isolated.
 *
 * Identity is carried per-request via the `x-test-user` header (NOT a
 * production mechanism — it only selects which fake uid the stubbed
 * `authenticate` attaches). Authentication itself is S2-tested.
 */

const path = require('path');
const express = require('express');
const { FakeFirestore, fakeAdmin } = require('./fake-firestore');

function testAuthenticate(req, res, next) {
  const uid = req.headers['x-test-user'] || 'user-A';
  req.user = { uid, email: `${uid}@test.dev` };
  req.auth = { uid, email: req.user.email, sessionChecked: false, admin: false };
  return next();
}

const aiStub = {
  generateSimilarProblem: async (title) => ({
    title: `Similar: ${title}`,
    difficulty: 'Medium',
    description: 'stub',
    functionSignature: 'public int solve(int[] nums)',
    examples: [],
    constraints: [],
  }),
  generateProblemDescription: async (title) => ({
    title,
    description: `Stub description for ${title}`,
    functionSignature: 'public int solve(int[] nums)',
    examples: [{ input: 'nums = [1]', output: '1', explanation: 'stub' }],
    constraints: ['1 <= nums.length <= 10'],
  }),
  generateProblemHelp: async () => ({ hints: [], solutions: {}, edgeCases: [] }),
  generateEdgeCases: async () => [],
  generateTestCases: async () => [],
  generateSolutionOnly: async () => ({ hints: [], solution: { code: 'stub' } }),
  generateLearningNotes: async () => ({ title: 'stub' }),
  generateTestInputsOnly: async () => [],
  analyzeUserCode: async () => ({}),
  generateDebriefQuestions: async () => ({ questions: [] }),
  analyzeDebriefResponse: async () => ({ confidenceScore: 3, advice: 'stub' }),
};

const codeRunnerStub = {
  // TRIGGER_429 in source simulates pool saturation (S6 route mapping test).
  runJava: async (source) => String(source || '').includes('TRIGGER_429')
    ? { stdout: '', stderr: 'Server busy: too many concurrent executions. Try again shortly.', exitCode: 1, timedOut: false, stage: 'queued', retryable: true }
    : { stdout: 'stub', stderr: '', exitCode: 0, timedOut: false, stage: 'run' },
  wrapSolutionClass: () => 'stub',
};

const problemAnalyzerStub = {
  analyzeProblem: async (title, platform = 'LeetCode', platformUrl = '') => ({
    title,
    platform,
    platformUrl,
    difficulty: 'Medium',
    topics: ['Array'],
    patterns: ['Two Pointers'],
    companies: [], // empty => skips the shared company-file write
    source: 'test-stub',
  }),
  updateCompanyDatabase: async () => {},
};

function installStubs(db) {
  const behind = (rel) => require.resolve(path.join(__dirname, '..', '..', rel));
  require.cache[behind('config/firebase.config')] = {
    id: behind('config/firebase.config'),
    filename: behind('config/firebase.config'),
    loaded: true,
    exports: { db, admin: fakeAdmin, auth: {} },
  };
  const mw = behind('middleware/auth.middleware');
  const mwExports = {
    authenticate: testAuthenticate,
    authenticateWithSessionCheck: testAuthenticate,
    requireAdmin: (req, res, next) => next(),
    softVerifyToken: (req, res, next) => next(),
    verifyToken: testAuthenticate,
  };
  require.cache[mw] = { id: mw, filename: mw, loaded: true, exports: mwExports };
  const ai = behind('services/ai.service');
  require.cache[ai] = { id: ai, filename: ai, loaded: true, exports: aiStub };
  const cr = behind('services/codeRunner.service');
  require.cache[cr] = { id: cr, filename: cr, loaded: true, exports: codeRunnerStub };
  const pa = behind('services/problem-analyzer.service');
  require.cache[pa] = { id: pa, filename: pa, loaded: true, exports: problemAnalyzerStub };
}

function buildApp() {
  const app = express();
  app.use(express.json());
  // Routers are required AFTER installStubs() so they pick up the fakes.
  app.use('/api/problems', require('../../routes/problems.routes'));
  app.use('/api/revisions', require('../../routes/revision.routes'));
  app.use('/api/analytics', require('../../routes/analytics.routes'));
  app.use('/api/ai', require('../../routes/ai.routes'));
  app.use('/api/auth', require('../../routes/auth.routes'));
  app.use('/api/run', require('../../routes/codeRunner.routes'));
  app.use('/api/company', require('../../routes/company.routes'));
  return app;
}

async function startApp() {
  const app = buildApp();
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, close: () => new Promise((r) => server.close(r)) };
}

async function api(base, method, urlPath, { user = 'user-A', body } = {}) {
  const res = await fetch(`${base}${urlPath}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-test-user': user },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

module.exports = { FakeFirestore, installStubs, startApp, api };
