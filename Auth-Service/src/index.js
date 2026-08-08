const express = require('express');

const { ServerConfig, Logger } = require('./config');
const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-token');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    Logger.info(`Auth-Service running on port ${ServerConfig.PORT}`);
});
