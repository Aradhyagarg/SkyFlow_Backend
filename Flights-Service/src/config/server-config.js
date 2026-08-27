const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    PORT: process.env.PORT || 4000,
    FLIGHT_SERVICE: process.env.FLIGHT_SERVICE || 'https://skyflow-airline-service.onrender.com',
    AUTH_SERVICE: process.env.AUTH_SERVICE || 'https://skyflow-auth-service.onrender.com',
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD
}