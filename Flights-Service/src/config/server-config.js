const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

module.exports = {
    PORT: process.env.PORT || 4000,
    FLIGHT_SERVICE: process.env.FLIGHT_SERVICE || 'https://skyflow-backend.aradhyagarg.deno.net',
    AUTH_SERVICE: process.env.AUTH_SERVICE || 'https://skyflow-backend.aradhyagarg.deno.net',
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_API_KEY || 'rzp_test_FZ7IMhBvL8Q5lf',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_API_SECRET || 'lVoVyR5NGd7CH3bV4E1oNrg9'
}