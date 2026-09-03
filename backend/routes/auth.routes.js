const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase.config');
// S2: strict authentication lives in middleware/auth.middleware.js. This
// re-export keeps existing `require('./auth.routes').verifyToken` consumers
// on the hardened implementation without per-route edits.
const { authenticate: verifyToken } = require('../middleware/auth.middleware');
const { limitTier } = require('../middleware/rateLimit');
// Note: authLimiter removed from /me route - Firebase handles actual login client-side

// GET /api/auth/me - Get current user with stats
// Note: This is a session check, NOT a login attempt. Limiter removed to avoid blocking page loads.
router.get('/me', verifyToken, limitTier('standard'), async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // S3: server-verified identity always wins. The stored doc is spread
    // first so a poisoned/migrated doc can never override uid/email/name.
    res.json({
      ...userData,
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name || req.user.email,
      totalXP: userData.totalXP || 0,
      currentStreak: userData.currentStreak || 0,
      longestStreak: userData.longestStreak || 0
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// POST /api/auth/signup - Create new user (handled by Firebase client-side)
// POST /api/auth/login - Login user (handled by Firebase client-side)
// POST /api/auth/logout - Logout user (handled by Firebase client-side)

module.exports = router;
module.exports.verifyToken = verifyToken;

