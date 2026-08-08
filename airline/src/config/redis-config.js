const Redis = require('ioredis');
const ServerConfig = require('./server-config');

// Initialize the Redis client with credentials from server configuration
const redisConfig = {
    host: ServerConfig.REDIS_HOST,
    port: ServerConfig.REDIS_PORT,
    username: ServerConfig.REDIS_USERNAME,
    password: ServerConfig.REDIS_PASSWORD,
    maxRetriesPerRequest: null
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
    console.error('Redis Connection Error:', err);
});

module.exports = redisClient;
