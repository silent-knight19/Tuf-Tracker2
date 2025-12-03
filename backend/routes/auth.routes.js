const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase.config');

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/auth/me - Get current user with stats
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    res.json({
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name || req.user.email,
      totalXP: userData.totalXP || 0,
      currentStreak: userData.currentStreak || 0,
      longestStreak: userData.longestStreak || 0,
      ...userData
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

