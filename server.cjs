const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Basic Security & Logging Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));

// Header sanitization middleware to prevent HTTP 431 errors
app.use((req, res, next) => {
    delete req.headers['cookie'];
    delete req.headers['x-devtools-emulate-network-conditions-client-id'];
    Object.keys(req.headers).forEach(key => {
        if (typeof req.headers[key] === 'string' && req.headers[key].length > 2048 && key !== 'authorization') {
            delete req.headers[key];
        }
    });
    next();
});

// Configure CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-token, x-idempotency-key');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root landing route
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Welcome to SkyFlow Unified API Server',
        healthCheck: '/api/health'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'SkyFlow Unified Server is healthy and running',
        timestamp: new Date()
    });
});

// Mount Microservice Routes Directly
try {
    const authRoutes = require('./Auth-Service/src/routes');
    const airlineRoutes = require('./airline/src/routes');
    const bookingRoutes = require('./Flights-Service/src/routes');

    app.use('/api', authRoutes);
    app.use('/api', airlineRoutes);
    app.use('/api', bookingRoutes);
    console.log('[SkyFlow Server] Successfully mounted Auth, Airline, and Booking routes directly');
} catch (e) {
    console.error('[SkyFlow Server] Error mounting routes:', e.stack || e.message);
}

// 404 Fallback
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found on SkyFlow Server: ${req.method} ${req.originalUrl}`
    });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`=================================================`);
        console.log(`   SkyFlow Unified Server running on port ${PORT} `);
        console.log(`=================================================`);
    });
}

module.exports = app;
