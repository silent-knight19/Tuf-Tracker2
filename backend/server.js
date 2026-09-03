const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Request logger middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No Origin'}`);
  next();
};

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
app.use(requestLogger);
app.use(helmet());

// Enhanced CORS configuration to handle preflight requests
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for origin: ${origin}`);
      callback(null, true); // Allow in development but log the warning
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));





// Soft auth for API routes
const { softVerifyToken } = require('./middleware/auth.middleware');
app.use('/api/', softVerifyToken);

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
