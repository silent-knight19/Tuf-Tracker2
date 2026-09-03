const cron = require('node-cron');
const http = require('http');
const https = require('https');

const initCronJobs = () => {
    // Schedule: Every 10 minutes (24/7)
    // This runs ~144 times a day -> ~4320 requests/month (still very low)
    // Note: Internal CRON can't keep server alive on free-tier hosting!
    // For true keep-alive, use external service (cron-job.org, UptimeRobot, etc.)
    // This mainly helps with quote refresh and provides logging when server is up
    
    // Cron expression: minute hour day-of-month month day-of-week
    cron.schedule('*/10 * * * *', () => {
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`;
        console.log(`⏰ Triggering keep-alive ping to: ${backendUrl}`);

        if (process.env.NODE_ENV === 'production' && backendUrl.includes('localhost')) {
            console.warn('⚠️  WARNING: specific BACKEND_URL not set in production. Keep-alive ping to localhost may not prevent server sleep on free tiers (Render/Heroku).');
        }
        
        const isHttps = backendUrl.startsWith('https');
        const client = isHttps ? https : http;

        const healthUrl = `${backendUrl}/health`;

        client.get(healthUrl, (res) => {
            console.log(`✅ Keep-alive ping successful: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('❌ Keep-alive ping failed:', err.message);
        });
    });

    // Schedule: Every day at midnight (Server time)
    // Task: Generate 50 new motivational quotes for the day
    cron.schedule('0 0 * * *', async () => {
        console.log('🗓️  CRON: Refreshing Daily Motivational Quotes...');
        try {
            const quoteService = require('../services/quote.service');
            await quoteService.refreshDailyQuotes();
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
