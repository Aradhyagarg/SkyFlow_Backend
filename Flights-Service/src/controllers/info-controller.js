const { StatusCodes } = require('http-status-codes');

const info = (req, res) => {
    console.log(`[Keep-Alive] Booking-Service health ping received at ${new Date().toISOString()}`);
    return res.status(StatusCodes.OK).json({
        success: true,
        message: 'API is live',
        error: {},
        data: {},
    });
}

module.exports = {
    info
}