const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase.config');
const { verifyToken } = require('./auth.routes');
const analyticsService = require('../services/analytics.service');

// GET /api/analytics/overview - Get overall statistics
router.get('/overview', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('problems')
      .where('userId', '==', req.user.uid)
      .get();

    const problems = [];
    snapshot.forEach(doc => {
      problems.push(doc.data());
    });

    const stats = analyticsService.calculateOverallStats(problems);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// GET /api/analytics/topics - Get topic distribution
router.get('/topics', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('problems')
      .where('userId', '==', req.user.uid)
      .get();

    const problems = [];
    snapshot.forEach(doc => {
      problems.push(doc.data());
    });

    const topicDistribution = analyticsService.calculateTopicDistribution(problems);

    res.json({ topics: topicDistribution });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// GET /api/analytics/patterns - Get pattern coverage
router.get('/patterns', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('problems')
      .where('userId', '==', req.user.uid)
      .get();

    const problems = [];
    snapshot.forEach(doc => {
      problems.push(doc.data());
    });

    const patternCoverage = analyticsService.calculatePatternCoverage(problems);

    res.json({ patterns: patternCoverage });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

// GET /api/analytics/platforms - Get platform distribution
router.get('/platforms', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('problems')
      .where('userId', '==', req.user.uid)
      .get();

    const problems = [];
    snapshot.forEach(doc => {
      problems.push(doc.data());
    });

    const platformDistribution = analyticsService.calculatePlatformDistribution(problems);

    res.json({ platforms: platformDistribution });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

// GET /api/analytics/difficulty - Get difficulty distribution
router.get('/difficulty', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('problems')
      .where('userId', '==', req.user.uid)
      .get();

    const problems = [];
    snapshot.forEach(doc => {
      problems.push(doc.data());
    });

    const difficultyDistribution = analyticsService.calculateDifficultyDistribution(problems);

    res.json(difficultyDistribution);
  } catch (error) {
    console.error('Error fetching difficulty distribution:', error);
    res.status(500).json({ error: 'Failed to fetch difficulty distribution' });
  }
});

// GET /api/analytics/heatmap - Get activity heatmap data
router.get('/heatmap', verifyToken, async (req, res) => {
  try {
    const snapshot = await db.collection('problems')
      .where('userId', '==', req.user.uid)
      .get();

    const problems = [];
    snapshot.forEach(doc => {
      problems.push(doc.data());
    });

    const heatmapData = analyticsService.generateHeatmapData(problems);

    res.json({ heatmap: heatmapData });
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ error: 'Failed to fetch heatmap' });
  }
});

// GET /api/analytics/timeline - Get progress timeline
router.get('/timeline', verifyToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const snapshot = await db.collection('problems')
      .where('userId', '==', req.user.uid)
      .get();

    const problems = [];
    snapshot.forEach(doc => {
      problems.push(doc.data());
    });

    const timeline = analyticsService.calculateProgressTimeline(problems, days);

    res.json({ timeline });
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

module.exports = router;
