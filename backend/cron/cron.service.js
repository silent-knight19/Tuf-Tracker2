const cron = require('node-cron');
const http = require('http');
const https = require('https');

const initCronJobs = () => {
    // Schedule: Every 14 minutes
    // Time range: 08:00 AM to 11:59 PM (server time)
    // This runs ~68 times a day -> ~2000 requests/month (negligible)
    // Active hours: ~18/day -> ~540-560 hours/month (Safe within 750h free tier)
    
    // Cron expression: minute hour day-of-month month day-of-week
    cron.schedule('*/14 06-23 * * *', () => {
        console.log('⏰ Triggering keep-alive ping...');
        
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const isHttps = backendUrl.startsWith('https');
        const client = isHttps ? https : http;

        const healthUrl = `${backendUrl}/health`;

        client.get(healthUrl, (res) => {
            console.log(`✅ Keep-alive ping successful: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error('❌ Keep-alive ping failed:', err.message);
        });
    });

    console.log('🗓️  Smart Cron initialized: Running every 14 mins (06:00-23:59)');
};

module.exports = { initCronJobs };
