const { StatusCodes } = require("http-status-codes");
const { AirplaneService } = require("../services");
const { SuccessResponse } = require("../utils/common");

/**
 * POST /airplanes
 * Create a new airplane
 */
async function createAirplane(req, res, next) {
  try {
    const airplane = await AirplaneService.createAirplane({
      modelNumber: req.body.modelNumber,
      capacity: req.body.capacity,
    });
    SuccessResponse.data = airplane;
    SuccessResponse.message = "Successfully created an airplane";
    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /airplanes
 * Get all airplanes
 */
async function getAirplanes(req, res, next) {
  try {
    const airplanes = await AirplaneService.getAirplanes();
    SuccessResponse.data = airplanes;
    SuccessResponse.message = "Successfully fetched all airplanes";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /airplanes/:id
 * Get a single airplane by ID
 */
async function getAirplane(req, res, next) {
  try {
    const airplane = await AirplaneService.getAirplane(req.params.id);
    SuccessResponse.data = airplane;
    SuccessResponse.message = "Successfully fetched the airplane";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /airplanes/:id
 * Delete an airplane by ID
 */
async function destroyAirplane(req, res, next) {
  try {
    const response = await AirplaneService.destoryAirplane(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the airplane";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createAirplane,
  getAirplanes,
  getAirplane,
  destroyAirplane,
};