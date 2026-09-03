const cron = require('node-cron');
// S13: the ONLY backend HTTP client besides the fixed-host SDKs. All fetches
// go through services/outbound.js (protocol/DNS/redirect/cap/timeout policy).
const { fetchText } = require('../services/outbound');

const initCronJobs = () => {
    // Schedule: Every 10 minutes (24/7)
    // This runs ~144 times a day -> ~4320 requests/month (still very low)
    // Note: Internal CRON can't keep server alive on free-tier hosting!
    // For true keep-alive, use external service (cron-job.org, UptimeRobot, etc.)
    // This mainly helps with quote refresh and provides logging when server is up
    
    // Cron expression: minute hour day-of-month month day-of-week
    cron.schedule('*/10 * * * *', async () => {
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
        console.log(`⏰ Triggering keep-alive ping to: ${backendUrl}`);

        if (process.env.NODE_ENV === 'production' && backendUrl.includes('localhost')) {
            console.warn('⚠️  WARNING: specific BACKEND_URL not set in production. Keep-alive ping to localhost may not prevent server sleep on free tiers (Render/Heroku).');
        }

        // S13: bounded fetch — 10s timeout (was: none, hanging sockets),
        // no redirects, tiny body cap. Private targets refused unless the
        // operator explicitly runs against one in non-production.
        const healthUrl = `${backendUrl}/health`;
        try {
            const res = await fetchText(healthUrl, {
                timeoutMs: 10000,
                maxBytes: 64 * 1024,
                maxRedirects: 0,
                allowPrivate: process.env.NODE_ENV !== 'production',
            });
            console.log(`✅ Keep-alive ping successful: ${res.status}`);
        } catch (err) {
            console.error(`❌ Keep-alive ping failed [${err.code || 'error'}]: ${err.message}`);
        }
    });

    // Schedule: Every day at midnight (Server time)
    // Task: Generate 50 new motivational quotes for the day
    cron.schedule('0 0 * * *', async () => {
        console.log('🗓️  CRON: Refreshing Daily Motivational Quotes...');
        try {
            const quoteService = require('../services/quote.service');
            // S15: soft refresh — skips when fresh, single-flight shared.
            await quoteService.refreshDailyQuotes({ force: false });
        } catch (error) {
            console.error('❌ CRON: Failed to refresh quotes:', error);
        }
    });

    // Initial check on startup - optional but good for dev
    setImmediate(async () => {
        try {
            const quoteService = require('../services/quote.service');
            await quoteService.getDailyQuotes(); // This will trigger refresh if empty
        } catch (error) {
            console.error('⚠️ Initial quote sync failed');
        }
    });

    console.log('🗓️  CRON initialized: Keep-alive every 10 mins (24/7) + Daily Quotes at midnight');
};

module.exports = { initCronJobs };
