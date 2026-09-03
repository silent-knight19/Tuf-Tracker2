const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase.config');
const { verifyToken } = require('./auth.routes');
const { validate } = require('../middleware/validate');
const S = require('../middleware/schemas');
const { limitTier } = require('../middleware/rateLimit');
const companyReadiness = require('../services/company-readiness.service');

// GET /api/company - Get all companies
router.get('/', verifyToken, limitTier('scan'), async (req, res) => {
  try {
    const companies = await companyReadiness.getAllCompanies();
    res.json({ companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET /api/company/:companyName - Get company-specific readiness
router.get('/:companyName', verifyToken, validate(S.company.byName), limitTier('scan'), async (req, res) => {
  try {
    const { companyName } = req.params;

    // Get user's problems
    const snapshot = await db.collection('problems')
      .where('userId', '==', req.user.uid)
      .get();

    const problems = [];
    snapshot.forEach(doc => {
      problems.push(doc.data());
    });

    const readiness = await companyReadiness.calculateReadiness(
      companyName,
      problems
    );

    res.json(readiness);
  } catch (error) {
    console.error('Error calculating readiness:', error);
    res.status(500).json({ error: 'Failed to calculate readiness', requestId: req.id || null });
  }
});

// GET /api/company/:companyName/problems - Get problems asked by a company
router.get('/:companyName/problems', verifyToken, validate(S.company.byName), limitTier('scan'), async (req, res) => {
  try {
    const { companyName } = req.params;

    const problems = await companyReadiness.getCompanyProblems(companyName);

    res.json({ company: companyName, problems });
  } catch (error) {
    console.error('Error fetching company problems:', error);
    res.status(500).json({ error: 'Failed to fetch company problems', requestId: req.id || null });
  }
});

// GET /api/company/:companyName/readiness - Same as /:companyName for convenience
router.get('/:companyName/readiness', verifyToken, validate(S.company.byName), limitTier('scan'), async (req, res) => {
  try {
    const { companyName } = req.params;

    const snapshot = await db.collection('problems')
      .where('userId', '==', req.user.uid)
      .get();

    const problems = [];
    snapshot.forEach(doc => {
      problems.push(doc.data());
    });

    const readiness = await companyReadiness.calculateReadiness(
      companyName,
      problems
    );

    res.json(readiness);
  } catch (error) {
    console.error('Error calculating readiness:', error);
    res.status(500).json({ error: 'Failed to calculate readiness', requestId: req.id || null });
  }
});

module.exports = router;
