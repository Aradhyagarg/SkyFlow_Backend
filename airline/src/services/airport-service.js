const { StatusCodes } = require('http-status-codes');
const { AirportRepository } = require('../repositories');
const airportRepository = new AirportRepository();
const  AppError = require('../utils/errors/app-error');

async function createAirport(data) {
    try {
        const airport = await airportRepository.create(data);
        return airport;
    } catch (error) {
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a new Airport object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAirport(id) {
    try {
        const airport = await airportRepository.get(id);
        return airport;
    } catch (error) {
        throw new AppError('Cannot fetch the data of the Airport', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAirports() {
    try {
        const airport = await airportRepository.getAll();
        return airport;
    } catch (error) {
        if(error.statusCode === StatusCodes.NOT_FOUND){
            throw new AppError('The airport you requested is not found', error.statusCode);
        }
        throw error;
    }
}

async function destoryAirport(id){
    try{
        const airport = await airportRepository.destroy(id);
        return airport;
    }catch(error){
        if(error.statusCode === StatusCodes.NOT_FOUND){
            throw new AppError('The airport you requested to delete is not found', error.statusCode);
        }
        throw error;
    }
}

module.exports = {
    createAirport,
    getAirport,
    getAirports,
    destoryAirport
};