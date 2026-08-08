const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const { ServerConfig } = require('../config');
const AppError = require('../utils/errors/app-error');
const { ErrorResponse } = require('../utils/common');

async function checkAuth(req, res, next) {
    try {
        const token = req.headers['x-access-token'];
        if(!token) {
            ErrorResponse.message = 'Authentication token missing';
            ErrorResponse.error = new AppError(['Missing JWT token in headers'], StatusCodes.UNAUTHORIZED);
            return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
        }
        
        const response = await axios.get(`${ServerConfig.AUTH_SERVICE}/api/v1/users/authenticate`, {
            headers: {
                'x-access-token': token
            }
        });
        
        if(response.data && response.data.success) {
            req.user = response.data.data.userId;
            req.role = response.data.data.role;
            next();
        } else {
            ErrorResponse.message = 'Authentication failed';
            ErrorResponse.error = new AppError(['Invalid token'], StatusCodes.UNAUTHORIZED);
            return res.status(StatusCodes.UNAUTHORIZED).json(ErrorResponse);
        }
    } catch(error) {
        ErrorResponse.message = 'User is not authenticated';
        const statusCode = error.response ? error.response.status : StatusCodes.INTERNAL_SERVER_ERROR;
        const explanation = error.response && error.response.data && error.response.data.error 
            ? error.response.data.error.explanation 
            : 'Something went wrong during auth call';
        ErrorResponse.error = new AppError([explanation], statusCode);
        return res.status(statusCode).json(ErrorResponse);
    }
}

function isAdmin(req, res, next) {
    if (req.role !== 'admin') {
        ErrorResponse.message = 'Unauthorized request';
        ErrorResponse.error = new AppError(['User does not have the Admin role required for this action'], StatusCodes.FORBIDDEN);
        return res.status(StatusCodes.FORBIDDEN).json(ErrorResponse);
    }
    next();
}

module.exports = {
    checkAuth,
    isAdmin
};
