require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Routes
const authRoutes = require('./routes/auth.routes');
const { verifyToken } = require('./routes/auth.routes');
const problemRoutes = require('./routes/problems.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const companyRoutes = require('./routes/company.routes');
const revisionRoutes = require('./routes/revision.routes');
const aiRoutes = require('./routes/ai.routes');
const quoteRoutes = require('./routes/quotes.routes');
const codeRunnerRoutes = require('./routes/codeRunner.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// Enhanced CORS configuration to handle preflight requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Rate limiting (applied to all other /api/ routes)
// Apply soft auth first so rate limiter sees the user email
const { softVerifyToken } = require('./middleware/auth.middleware');
const { standardLimiter } = require('./middleware/rateLimit.middleware');
app.use('/api/', softVerifyToken, standardLimiter);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});



// Initialize Cron Jobs
const { initCronJobs } = require('./cron/cron.service');
initCronJobs();

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TufTracker Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
