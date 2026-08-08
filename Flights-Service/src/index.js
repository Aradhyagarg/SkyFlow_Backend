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

app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(ServerConfig.PORT, async () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    CRONS();
    try {
        await QueueConfig.connectQueue();
    } catch (error) {
        console.error('Failed to initialize Queue connection:', error);
    }
});
// Nodemon restart trigger for queue configuration update
