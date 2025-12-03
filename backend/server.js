require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/auth.routes');
const { verifyToken } = require('./routes/auth.routes');
const problemRoutes = require('./routes/problems.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const companyRoutes = require('./routes/company.routes');
const revisionRoutes = require('./routes/revision.routes');
const aiRoutes = require('./routes/ai.routes');
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
  exposedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - TEMPORARILY DISABLED FOR DEVELOPMENT
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/revisions', revisionRoutes);
app.use('/api/ai', aiRoutes);
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



// Start server
app.listen(PORT, () => {
  console.log(`🚀 TufTracker Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
