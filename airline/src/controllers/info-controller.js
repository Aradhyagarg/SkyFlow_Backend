const {StatusCodes} = require('http-status-codes');
const info = (req, res) => {
    return res.status(StatusCodes.OK).json({
        success: true,
        message: "API is live",
        error: 0,
        data: {}
    });
};

module.exports = {
    info
};