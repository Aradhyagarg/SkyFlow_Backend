const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Something went wrong';
    
    ErrorResponse.message = message;
    ErrorResponse.error = err;
    
    return res.status(statusCode).json(ErrorResponse);
}

module.exports = errorHandler;
