const { StatusCodes } = require('http-status-codes');
const { RedisClient } = require('../config');
const AppError = require('../utils/errors/app-error');

// Default limits: 100 requests per minute
const LIMIT = 10;
const WINDOW_MS = 60000; // 60 seconds

async function rateLimiter(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const key = `rate_limit:${ip}:flights-search`;
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    console.log(windowStart);
    console.log(key);
    console.log(now);
    console.log(WINDOW_MS);

    try {
        // Clean up old requests and get the current number of requests in the window
        const results = await RedisClient.multi()
            .zremrangebyscore(key, 0, windowStart)
            .zcard(key)
            .exec();

        const requestCount = results[1][1];

        if (requestCount >= LIMIT) {
            return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                success: false,
                message: 'Too many requests, please try again later.',
                data: {},
                error: {
                    statusCode: StatusCodes.TOO_MANY_REQUESTS,
                    explanation: 'Rate limit exceeded'
                }
            });
        }

        // Add this request's timestamp to the sorted set and set key expiration
        await RedisClient.multi()
            .zadd(key, now, `${now}-${Math.random()}`)
            .expire(key, Math.ceil(WINDOW_MS / 1000))
            .exec();

        next();
    } catch (error) {
        console.error('Rate Limiter Error:', error);
        // Fallback: if Redis fails, we should let the request pass so we don't break our API
        next();
    }
}

module.exports = rateLimiter;
