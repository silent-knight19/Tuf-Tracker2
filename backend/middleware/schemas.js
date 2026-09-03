/**
 * S4 — central request-schema catalog. One audit surface for every route's
 * contract: sizes, enums, array caps, strict unknown-field rejection.
 *
 * Conventions:
 *  - `optional`/`nullable` mirror what the frontend actually sends (axios drops
 *    `undefined`, serializes `null`), so `null` is accepted only where callers
 *    send it — never for persistence without handler allowlisting.
 *  - Fields marked IGNORED are accepted for backwards compatibility (older UI
 *    versions send them) but never persisted; handlers must not read them.
 *  - Identity/ownership (`userId`, `uid`) appears in NO schema: it comes only
 *    from the verified token (S3).
 */

const v = require('./validate');

const {
  string, number, boolean, arrayOf, union, object,
  optional, nullable, req, docId, urlString, scalar, dsaArg, safeJson,
} = v;

// --- shared fragments -------------------------------------------------------

const title = () => string({ min: 1, max: 200 });
const difficulty = () => string({ min: 1, max: 20, pattern: /^[A-Za-z ]+$/ });
const topicList = () => arrayOf(string({ min: 1, max: 60 }), { max: 20 });
const strArr = (maxItems, maxLen) =>
  arrayOf(string({ min: 1, max: maxLen }), { max: maxItems });
const boolOpt = () => boolean();

// AI-echo example object (frontend + cached AI shapes).
const exampleItem = () => object({
  input: nullable(dsaArg()),
  output: nullable(dsaArg()),
  explanation: nullable(string({ min: 1, max: 4000 })),
  name: nullable(string({ min: 1, max: 200 })),
  expected: nullable(dsaArg()),
  expectedOutput: nullable(dsaArg()),
  category: nullable(string({ min: 1, max: 60 })),
  args: nullable(arrayOf(dsaArg(), { max: 20 })),
}, { strict: true });

// Generic bounded AI-echo item (test cases, edge cases): known keys validated,
// nothing else admitted.
const echoItem = () => object({
  name: nullable(string({ min: 1, max: 200 })),
  input: nullable(dsaArg()),
  args: nullable(arrayOf(dsaArg(), { max: 20 })),
  expected: nullable(dsaArg()),
  expectedOutput: nullable(dsaArg()),
  category: nullable(string({ min: 1, max: 60 })),
}, { strict: true });

const idParams = () => object({ id: req(docId()) });

// --- problems ---------------------------------------------------------------

const problems = {
  list: {
    query: object({
      topic: optional(string({ min: 1, max: 100 })),
      pattern: optional(string({ min: 1, max: 100 })),
      difficulty: optional(string({ min: 1, max: 20 })),
      company: optional(string({ min: 1, max: 100 })),
      topics: optional(string({ min: 1, max: 2000 })),
      patterns: optional(string({ min: 1, max: 2000 })),
      search: optional(string({ min: 1, max: 200 })),
    }, { strict: true }),
  },
  create: {
    body: object({
      title: req(title()),
      platform: optional(string({ min: 1, max: 60 })),
      platformUrl: optional(urlString()),
      notes: optional(string({ min: 0, max: 50000 })),
      approach: optional(string({ min: 0, max: 50000 })),
      code: optional(string({ min: 0, max: 100000 })),
      aiNotes: optional(safeJson(6, 100000)),
      // IGNORED (compat: ProblemsPage/AddProblemModal send these; the
      // server-side analyzer is authoritative and handlers must not persist them).
      difficulty: optional(difficulty()),
      topics: optional(topicList()),
      patterns: optional(topicList()),
      status: optional(string({ min: 0, max: 30 })),
    }, { strict: true }),
  },
  byId: { params: idParams() },
  update: {
    params: idParams(),
    body: object({
      notes: optional(string({ min: 0, max: 50000 })),
      approach: optional(string({ min: 0, max: 50000 })),
      code: optional(string({ min: 0, max: 100000 })),
      difficulty: optional(difficulty()),
      topics: optional(topicList()),
      patterns: optional(topicList()),
      aiNotes: optional(safeJson(6, 100000)),
      status: optional(string({ min: 0, max: 30 })), // IGNORED (compat: ProblemsPage sends it)
    }, { strict: true, minKeys: 1 }),
  },
  analyze: {
    body: object({
      title: req(title()),
      platform: optional(string({ min: 1, max: 60 })),
      platformUrl: optional(urlString()),
    }, { strict: true }),
  },
  forceRefreshBody: {
    body: object({ forceRefresh: optional(boolean()) }, { strict: true }),
  },
  generateNotesPreview: {
    body: object({
      title: req(title()),
      platform: optional(string({ min: 1, max: 60 })),
      platformUrl: optional(urlString()),
      difficulty: optional(difficulty()),
      topics: optional(topicList()),
      patterns: optional(topicList()),
      forceRefresh: optional(boolean()),
    }, { strict: true }),
  },
  generateDescriptionPreview: {
    body: object({
      title: req(title()),
      platform: optional(string({ min: 1, max: 60 })),
      difficulty: optional(difficulty()),
      topics: optional(topicList()),
      patterns: optional(topicList()),
    }, { strict: true }),
  },
  // Body accepted-and-ignored (compat: problemStore sends problem fields);
  // the stored document is authoritative (S3).
  generateDescription: {
    params: idParams(),
    body: object({
      title: optional(title()),
      platform: optional(string({ min: 1, max: 60 })),
      difficulty: optional(difficulty()),
      topics: optional(topicList()),
      patterns: optional(topicList()),
    }, { strict: true }),
  },
};

// --- revisions --------------------------------------------------------------

const revisions = {
  create: {
    body: object({
      problemId: req(docId()),
      problemTitle: optional(string({ min: 1, max: 200 })),
      coreIdea: optional(string({ min: 1, max: 10000 })),
      pattern: optional(string({ min: 1, max: 100 })),
      patterns: optional(topicList()),
      topics: optional(topicList()),
      difficulty: optional(difficulty()),
    }, { strict: true }),
  },
  byId: { params: idParams() },
  review: {
    params: idParams(),
    body: object({
      confidence: req(number({ min: 1, max: 5, int: true, coerce: true })),
      notes: optional(string({ min: 0, max: 20000 })),
      coreIdea: optional(string({ min: 0, max: 10000 })),
      algorithmSteps: optional(arrayOf(string({ min: 1, max: 2000 }), { max: 100 })),
      edgeCases: optional(arrayOf(
        union([string({ min: 1, max: 2000 }), echoItem()]), { max: 100 }
      )),
      timeTaken: optional(number({ min: 0, max: 86400, coerce: true })),
      guidedData: optional(object({}, { strict: false })), // IGNORED (compat: GuidedReviewModal)
      checklist: optional(object({}, { strict: false })), // IGNORED (compat: QuickReviewModal)
    }, { strict: true }),
  },
  logTime: {
    params: idParams(),
    body: object({
      phase: optional(string({ min: 1, max: 60 })),
      timeTaken: req(number({ min: 0, max: 86400, coerce: true })),
    }, { strict: true }),
  },
  patch: {
    params: idParams(),
    body: object({
      coreIdea: optional(string({ min: 0, max: 10000 })),
      algorithmSteps: optional(arrayOf(string({ min: 1, max: 2000 }), { max: 100 })),
      edgeCases: optional(arrayOf(
        union([string({ min: 1, max: 2000 }), echoItem()]), { max: 100 }
      )),
      notes: optional(string({ min: 0, max: 20000 })),
      // Debrief fields the UI already sends but the server used to drop;
      // now validated AND persisted (S4 fix).
      confidenceScore: optional(number({ min: 0, max: 5, coerce: true })),
      aiAdvice: optional(string({ min: 1, max: 20000 })),
    }, { strict: true, minKeys: 1 }),
  },
  practice: {
    body: object({
      count: optional(number({ min: 1, max: 50, int: true, coerce: true })),
    }, { strict: true }),
  },
};

// --- analytics / company ----------------------------------------------------

const analytics = {
  query: object({
    days: optional(string({ min: 1, max: 4, pattern: /^\d{1,4}$/ })),
  }, { strict: true }),
};

const companyName = () => string({ min: 1, max: 100, pattern: /^[\p{L}\p{N} .&'_-]+$/u });
const company = {
  byName: { params: object({ companyName: req(companyName()) }, { strict: true }) },
};

// --- AI ---------------------------------------------------------------------

const ai = {
  similar: { body: object({ problemId: req(docId()) }, { strict: true }) },
  custom: {
    body: object({
      pattern: optional(string({ min: 1, max: 100 })),
      topic: optional(string({ min: 1, max: 100 })),
      difficulty: req(difficulty()),
    }, { strict: true }),
  },
  companyProblem: {
    body: object({
      company: req(string({ min: 1, max: 100 })),
      topic: optional(string({ min: 1, max: 100 })),
      pattern: optional(string({ min: 1, max: 100 })),
      difficulty: req(difficulty()),
    }, { strict: true }),
  },
  problemHelp: {
    body: object({
      title: req(title()),
      description: req(string({ min: 1, max: 20000 })),
      difficulty: optional(difficulty()),
      forceRefresh: optional(boolean()),
      pattern: nullable(string({ min: 1, max: 100 })),
      examples: optional(arrayOf(exampleItem(), { max: 30 })),
      constraints: optional(strArr(100, 1000)),
      functionSignature: nullable(string({ min: 1, max: 2000 })),
      mode: optional(string({ min: 1, max: 40 })),
      providedSolution: nullable(string({ min: 1, max: 100000 })),
      existingEdgeCases: nullable(arrayOf(echoItem(), { max: 50 })),
    }, { strict: true }),
  },
  problemDescription: {
    body: object({
      title: req(title()),
      platform: optional(string({ min: 1, max: 60 })),
      difficulty: optional(difficulty()),
      topics: optional(topicList()),
      patterns: optional(topicList()),
    }, { strict: true }),
  },
  edgeCases: {
    body: object({
      title: req(title()),
      description: optional(string({ min: 1, max: 20000 })),
      examples: optional(arrayOf(exampleItem(), { max: 30 })),
      constraints: optional(strArr(100, 1000)),
      functionSignature: nullable(string({ min: 1, max: 2000 })),
      providedSolution: nullable(string({ min: 1, max: 100000 })),
    }, { strict: true }),
  },
  learningNotes: {
    body: object({
      pattern: nullable(string({ min: 1, max: 100 })),
      topic: nullable(string({ min: 1, max: 100 })),
      forceRefresh: optional(boolean()),
    }, {
      strict: true,
      refine: (o) => (!o.pattern && !o.topic ? 'at least one of pattern or topic is required' : null),
    }),
  },
  testCases: {
    body: object({
      title: req(title()),
      description: optional(string({ min: 1, max: 20000 })),
      constraints: optional(strArr(100, 1000)),
      functionSignature: nullable(string({ min: 1, max: 2000 })),
      forceRefresh: optional(boolean()),
    }, { strict: true }),
  },
  solution: {
    body: object({
      title: req(title()),
      description: optional(string({ min: 1, max: 20000 })),
      difficulty: optional(difficulty()),
      functionSignature: nullable(string({ min: 1, max: 2000 })),
      testCases: optional(arrayOf(echoItem(), { max: 50 })),
    }, { strict: true }),
  },
  analyzeCode: {
    body: object({
      code: req(string({ min: 1, max: 100000 })),
      problemDescription: req(string({ min: 1, max: 20000 })),
      examples: optional(arrayOf(exampleItem(), { max: 30 })),
      constraints: optional(strArr(100, 1000)),
      optimalComplexity: nullable(object({}, { strict: false })),
      executionFeedback: nullable(object({}, { strict: false })),
    }, { strict: true }),
  },
  debriefQuestions: {
    body: object({
      title: req(title()),
      difficulty: optional(difficulty()),
    }, { strict: true }),
  },
  debriefAnalyze: {
    body: object({
      title: req(title()),
      questions: req(strArr(10, 2000)),
      answers: req(strArr(10, 5000)),
    }, { strict: true }),
  },
};

// --- code runner ------------------------------------------------------------

const codeRunner = {
  run: {
    body: object({
      source: req(string({ min: 1, max: 100000 })),
      stdin: optional(string({ min: 1, max: 200000 })),
      problemId: optional(string({ min: 1, max: 256 })),
    }, { strict: true }),
  },
};

module.exports = { problems, revisions, analytics, company, ai, codeRunner };
