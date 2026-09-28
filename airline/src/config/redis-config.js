const Redis = require('ioredis');
const ServerConfig = require('./server-config');

// Initialize the Redis client with credentials from server configuration
const redisConfig = {
    host: ServerConfig.REDIS_HOST || '127.0.0.1',
    port: ServerConfig.REDIS_PORT || 6379,
    username: ServerConfig.REDIS_USERNAME,
    password: ServerConfig.REDIS_PASSWORD,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
        if (times > 2) return null;
        return Math.min(times * 100, 1000);
    }
};

// Enable TLS for cloud Redis (Upstash) in production
if (process.env.NODE_ENV !== 'development' && ServerConfig.REDIS_HOST && ServerConfig.REDIS_HOST.includes('upstash.io')) {
    redisConfig.tls = {};
}

const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
    console.log('Connected to Redis server successfully.');
});

redisClient.on('error', (err) => {
    console.warn('Redis connection issue (non-fatal):', err.message);
});

module.exports = redisClient;
