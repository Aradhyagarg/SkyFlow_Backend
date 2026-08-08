const Redis = require('ioredis');
const ServerConfig = require('./server-config');

// Initialize the Redis client with credentials from server configuration
const redisClient = new Redis({
    host: ServerConfig.REDIS_HOST,
    port: ServerConfig.REDIS_PORT,
    username: ServerConfig.REDIS_USERNAME,
    password: ServerConfig.REDIS_PASSWORD,
    maxRetriesPerRequest: null
});

redisClient.on('connect', () => {
    console.log('Connected to Redis server successfully.');
});

redisClient.on('error', (err) => {
    console.error('Redis Connection Error:', err);
});

module.exports = redisClient;
