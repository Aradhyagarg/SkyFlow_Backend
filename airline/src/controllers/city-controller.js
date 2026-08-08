const { StatusCodes } = require('http-status-codes');
const { CityService } = require('../services');
const { SuccessResponse } = require('../utils/common');

/**
 * POST /cities
 * Create a new city
 */
async function createCity(req, res, next) {
    try {
        const city = await CityService.createCity({
            name: req.body.name
        });
        SuccessResponse.data = city;
        SuccessResponse.message = 'Successfully created a city';
        return res.status(StatusCodes.CREATED).json(SuccessResponse);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createCity
};