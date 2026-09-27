const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

module.exports = {
    PORT: process.env.PORT || 5000,
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS) || 8,
    JWT_SECRET: process.env.JWT_KEY || process.env.JWT_SECRET || 'Flights@3445',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '1d'
};
