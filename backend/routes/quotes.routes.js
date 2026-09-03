const express = require('express');
const router = express.Router();
const quoteService = require('../services/quote.service');
// S2: refresh wipes the collection + spends AI budget → ADMIN only, with
// revocation/disabled enforcement (high-impact route).
const {
  authenticateWithSessionCheck,
  requireAdmin,
} = require('../middleware/auth.middleware');
const { aiLimit, sendAiError } = require('../services/ai.limits');
const { limitTier } = require('../middleware/rateLimit');

// Get all daily quotes
router.get('/', limitTier('public'), async (req, res) => {
  try {
    const quotes = await quoteService.getDailyQuotes();
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Admin-only trigger to refresh (Protected: session-checked + allowlisted)
router.post('/refresh', authenticateWithSessionCheck, requireAdmin, aiLimit('standard'), limitTier('standard'), async (req, res) => {
  try {
    // S15: deliberate manual refresh always runs (force) — cron/startup skip fresh.
    const quotes = await quoteService.refreshDailyQuotes({ force: true });
    try {
      require('../services/securityLog').secEvent('admin.action', req, { result: 'allow', action: 'quotes.refresh', count: quotes.length });
    } catch { /* logging never breaks admin */ }
    res.json({ message: 'Quotes refreshed successfully', count: quotes.length });
  } catch (error) {
    return sendAiError(res, error, 'Failed to refresh quotes');
  }
});

module.exports = router;
