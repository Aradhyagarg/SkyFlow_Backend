const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');
const { airplaneSchema } = require('../utils/common/validation-schemas');
const AppError = require('../utils/errors/app-error');

function validateCreateRequest(req, res, next) {
    const { error } = airplaneSchema.validate(req.body);
    if (error) {
        ErrorResponse.message = 'Something went wrong while creating airplane';
        ErrorResponse.error = new AppError([error.details[0].message], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateCreateRequest
};