const { StatusCodes } = require('http-status-codes');
const { ErrorResponse } = require('../utils/common');
const { flightSchema, seatUpdateSchema, flightStatusUpdateSchema } = require('../utils/common/validation-schemas');
const AppError = require('../utils/errors/app-error');

function validateCreateRequest(req, res, next) {
    const { error } = flightSchema.validate(req.body);
    if (error) {
        ErrorResponse.message = 'Something went wrong while creating flight';
        ErrorResponse.error = new AppError([error.details[0].message], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateUpdateSeatsRequest(req, res, next) {
    const { error } = seatUpdateSchema.validate(req.body);
    if (error) {
        ErrorResponse.message = 'Something went wrong while updating seats';
        ErrorResponse.error = new AppError([error.details[0].message], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

function validateUpdateStatusRequest(req, res, next) {
    const { error } = flightStatusUpdateSchema.validate(req.body);
    if (error) {
        ErrorResponse.message = 'Something went wrong while updating flight status';
        ErrorResponse.error = new AppError([error.details[0].message], StatusCodes.BAD_REQUEST);
        return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }
    next();
}

module.exports = {
    validateCreateRequest,
    validateUpdateSeatsRequest,
    validateUpdateStatusRequest
};