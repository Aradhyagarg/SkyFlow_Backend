const { StatusCodes } = require('http-status-codes');
const { AirplaneRepository } = require('../repositories');
const airplaneRepository = new AirplaneRepository();
const  AppError = require('../utils/errors/app-error');

async function createAirplane(data) {
    try {
        const airplane = await airplaneRepository.create(data);
        return airplane;
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a new Airplane object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAirplane(id) {
    try {
        const airplane = await airplaneRepository.get(id);
        return airplane;
    } catch (error) {
        throw error;
    }
}

async function getAirplanes() {
    try {
        const airplanes = await airplaneRepository.getAll();
        return airplanes;
    } catch (error) {
        if(error.statusCode === StatusCodes.NOT_FOUND){
            throw new AppError('The airplane you requested is not found', error.statusCode);
        }
        throw error;
    }
}

async function destoryAirplane(id){
    try{
        const airplane = await airplaneRepository.destroy(id);
        return airplane;
    }catch(error){
        if(error.statusCode === StatusCodes.NOT_FOUND){
            throw new AppError('The airplane you requested to delete is not found', error.statusCode);
        }
        throw error;
    }
}

module.exports = {
    createAirplane,
    getAirplane,
    getAirplanes,
    destoryAirplane
};