const { StatusCodes } = require("http-status-codes");
const { AirportService } = require("../services");
const { SuccessResponse } = require("../utils/common");

/**
 * POST /airports
 * Create a new airport
 */
async function createAirport(req, res, next) {
  try {
    const airport = await AirportService.createAirport({
      name: req.body.name,
      code: req.body.code,
      address: req.body.address,
      cityId: req.body.cityId,
    });
    SuccessResponse.data = airport;
    SuccessResponse.message = "Successfully created an airport";
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /airports
 * Get all airports
 */
async function getAirports(req, res, next) {
  try {
    const airports = await AirportService.getAirports();
    SuccessResponse.data = airports;
    SuccessResponse.message = "Successfully fetched all airports";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /airports/:id
 * Get a single airport by ID
 */
async function getAirport(req, res, next) {
  try {
    const airport = await AirportService.getAirport(req.params.id);
    SuccessResponse.data = airport;
    SuccessResponse.message = "Successfully fetched the airport";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /airports/:id
 * Delete an airport by ID
 */
async function destroyAirport(req, res, next) {
  try {
    const response = await AirportService.destoryAirport(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the airport";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAirport,
  getAirports,
  getAirport,
  destroyAirport,
};