const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Basic Security & Logging Middlewares
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(morgan('dev'));

// Header sanitization middleware to prevent HTTP 431 Request Header Fields Too Large
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

// Root landing route
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Welcome to SkyFlow Unified API Gateway',
        healthCheck: '/api/health'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'API Gateway is healthy and running',
        timestamp: new Date()
    });
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Direct In-Memory Microservice Routing (fallback for suspended external services)
try {
    const authRoutes = require('../Auth-Service/src/routes');
    const airlineRoutes = require('../airline/src/routes');
    const bookingRoutes = require('../Flights-Service/src/routes');

    app.use('/api', authRoutes);
    app.use('/api', airlineRoutes);
    app.use('/api', bookingRoutes);
    console.log('[Unified Backend] Mounted Auth, Airline, and Booking routes directly in memory');
} catch (e) {
    console.error('[Unified Backend] Error mounting direct routes:', e.message);
}

// 404 Route Fallback
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found on API Gateway: ${req.method} ${req.originalUrl}`
    });
});

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`   SkyFlow API Gateway running on port ${PORT}   `);
    console.log(`=================================================`);
});
