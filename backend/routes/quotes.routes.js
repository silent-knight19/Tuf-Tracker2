const express = require('express');
const router = express.Router();
const quoteService = require('../services/quote.service');
const { verifyToken } = require('./auth.routes');

// Get all daily quotes
router.get('/', async (req, res) => {
  try {
    const quotes = await quoteService.getDailyQuotes();
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Admin-only trigger to refresh (Protected)
router.post('/refresh', verifyToken, async (req, res) => {
  try {
    const quotes = await quoteService.refreshDailyQuotes();
    res.json({ message: 'Quotes refreshed successfully', count: quotes.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh quotes' });
  }
});

module.exports = router;
