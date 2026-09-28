const express = require('express');

const { ServerConfig, QueueConfig } = require('./config');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares');
const CRONS = require('./utils/common/cron-jobs');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-token, x-idempotency-key');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'SkyFlow Booking-Service is live and operational'
    });
});

app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(ServerConfig.PORT, async () => {
        console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
        CRONS();
        try {
            await QueueConfig.connectQueue();
        } catch (error) {
            console.error('Failed to initialize Queue connection:', error);
        }
    });
}

module.exports = app;
// Nodemon restart trigger for queue configuration update
