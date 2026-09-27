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
    contentSecurityPolicy: false // Disable CSP headers to permit frontend assets loading if hosted together
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

// Configure CORS manually to handle custom preflights cleanly
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

// Keep-alive mechanism to prevent Render free-tier hibernation (pings every 14 minutes with 60s timeout for cold starts)
const SERVICES_TO_PING = [
    'https://skyflow-api-gateway.onrender.com/api/health',
    'https://skyflow-auth-service.onrender.com/api/v1/info',
    'https://skyflow-airline-service.onrender.com/api/v1/info',
    'https://skyflow-booking-service.onrender.com/api/v1/info'
];

setInterval(() => {
    SERVICES_TO_PING.forEach(async (url) => {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 60000); // 60s timeout for Render cold-starts
            await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            console.log(`[Keep-Alive] Pinged ${url} successfully at ${new Date().toISOString()}`);
        } catch (err) {
            console.log(`[Keep-Alive] Ping to ${url} failed: ${err.message}`);
        }
    });
}, 14 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`   SkyFlow API Gateway running on port ${PORT}   `);
    console.log(`   Routing details:                              `);
    console.log(`   - /api/v1/users    => ${process.env.AUTH_SERVICE_URL}`);
    console.log(`   - /api/v1/flights  => ${process.env.AIRLINE_SERVICE_URL}`);
    console.log(`   - /api/v1/bookings => ${process.env.BOOKING_SERVICE_URL}`);
    console.log(`=================================================`);
});
