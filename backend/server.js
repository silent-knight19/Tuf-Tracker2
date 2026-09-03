const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// S1: fail-closed startup validation. Must run before any route/service is
// required, so a misconfigured process can never serve traffic.
const { initEnv } = require('./config/env.validation');
const env = initEnv();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { requestId, notFound, errorMiddleware } = require('./middleware/errors');

// Request logger middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] id=${req.id || '-'} ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No Origin'}`);
  next();
};

// Routes
const authRoutes = require('./routes/auth.routes');
const problemRoutes = require('./routes/problems.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const companyRoutes = require('./routes/company.routes');
const revisionRoutes = require('./routes/revision.routes');
const aiRoutes = require('./routes/ai.routes');
const quoteRoutes = require('./routes/quotes.routes');
const codeRunnerRoutes = require('./routes/codeRunner.routes');

const app = express();
const PORT = env.port;
const HOST = env.host;

// S10: single-proxy topology (Render terminates TLS one hop away). Required
// for correct scheme/host/IP semantics; S14 IP limits build on this.
app.set('trust proxy', 1);

// Middleware (S11: requestId first so every log/error carries correlation).
app.use(requestId);
app.use(requestLogger);
// S10: explicit header policy. This API serves JSON only: no framing, no
// plugins, no ambient permissions. (CORP/COOP keep helmet defaults — CORS-mode
// fetch, which our frontend uses, is unaffected by CORP same-origin.)
const { helmetOptions } = require('./config/cors.policy');
app.use(helmet(helmetOptions()));
// Version-proof Permissions-Policy (helmet major versions rename the option).
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  next();
});

// S10: fail-closed CORS (policy in config/cors.policy.js — pure, unit-tested).
// The S0 code logged blocked origins and allowed them anyway (proven live:
// evil.test received ACAO + credentials). Now the deny branch is a denial.
// credentials:true pairs ONLY with exact allowlisted origins.
const { corsOptions, buildAllowedOrigins } = require('./config/cors.policy');
const ALLOWED_ORIGINS = buildAllowedOrigins(env);
app.use(cors(corsOptions(env)));

// S4: global transport cap. Per-field caps in middleware/schemas.js are the
// primary control; this bounds the raw body before parsing (prototype-pollution
// and nesting-depth guards run inside validate()).
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));





// S14: pre-auth IP valve FIRST (verify-cost protection), then soft identity.
// Soft auth for API routes
const { softVerifyToken } = require('./middleware/auth.middleware');
const { preAuthValve } = require('./middleware/rateLimit');
app.use('/api/', preAuthValve(), softVerifyToken);

// Health check - used for cold start detection and keep-alive pings
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime() // seconds since server started
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/revisions', revisionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/run', codeRunnerRoutes);

// S11: safe 404 + internal/public error split (replaces the raw err.message handler).
app.use('/api/', notFound);
app.use(notFound);
app.use(errorMiddleware);



// Initialize Cron Jobs
const { initCronJobs } = require('./cron/cron.service');
initCronJobs();

// Start server
app.listen(PORT, HOST, () => {
  console.log(`[BaseCase:Server] Backend running on ${HOST}:${PORT}`);
  console.log(`[BaseCase:Server] Environment: ${env.nodeEnv}`);
});

module.exports = app;
// S10 test surface.
module.exports.ALLOWED_ORIGINS = ALLOWED_ORIGINS;
