const { StatusCodes } = require('http-status-codes');
const { Op } = require('sequelize')
const { FlightRepository } = require('../repositories');
const { RedisClient } = require('../config');
const AppError = require('../utils/errors/app-error');
const flightRepository = new FlightRepository();

async function invalidateFlightCache() {
    try {
        const stream = RedisClient.scanStream({
            match: 'flights_search:*',
            count: 100
        });
        
        stream.on('data', async (keys) => {
            if (keys.length > 0) {
                const pipeline = RedisClient.pipeline();
                keys.forEach(key => pipeline.del(key));
                await pipeline.exec();
            }
        });
        
        console.log("Successfully triggered flight search cache invalidation.");
    } catch (err) {
        console.error("Failed to invalidate flight cache:", err);
    }
}

async function createFlight(data) {
    if (data.departureAirportId === data.arrivalAirportId) {
        throw new AppError('Departure and Arrival Airport cannot be same', StatusCodes.BAD_REQUEST);
    }
    try {
        const flight = await flightRepository.create(data);
        await invalidateFlightCache();
        return flight;
    } catch (error) {
        if (error instanceof AppError) throw error;
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            let explanation = [];
            error.errors.forEach((err) => {
                explanation.push(err.message);
            });
            throw new AppError(explanation, StatusCodes.BAD_REQUEST);
        }
        throw new AppError(error.message || 'Cannot create a new Flight object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getAllFlights(query){
    const cacheKey = `flights_search:${JSON.stringify(query)}`;
    
    try {
        const cachedFlights = await RedisClient.get(cacheKey);
        if (cachedFlights) {
            console.log("Serving flight search from Redis cache...");
            return JSON.parse(cachedFlights);
        }
    } catch (redisErr) {
        console.error("Redis Cache Read Error:", redisErr);
    }

    let customFilter = {};
    let sortFilter = [];
    const endOfDate = " 23:59:59";
    
    // Validate matching airports if passed directly
    if (query.departureAirportId && query.arrivalAirportId && query.departureAirportId === query.arrivalAirportId) {
        throw new AppError('Departure and Arrival Airport cannot be same', StatusCodes.BAD_REQUEST);
    }

    if (query.departureAirportId) {
        customFilter.departureAirportId = query.departureAirportId;
    }
    if (query.arrivalAirportId) {
        customFilter.arrivalAirportId = query.arrivalAirportId;
    }

    // trips=MUM-DEL-2026-05-11
    if(query.trips){
        const [departureAirportId, arrivalAirportId, date] = query.trips.split("-");
        if (departureAirportId === arrivalAirportId) {
            throw new AppError('Departure and Arrival Airport cannot be same', StatusCodes.BAD_REQUEST);
        }
        customFilter.departureAirportId = departureAirportId;
        customFilter.arrivalAirportId = arrivalAirportId;
        if(date) {
            customFilter.departureTime = {
                [Op.between]: [date, date + endOfDate]
            }
        }
    }

    // price=1000-5000
    if(query.price) {
        const [minPrice, maxPrice] = query.price.split("-");
        customFilter.price = {
            [Op.between]: [minPrice, (maxPrice === undefined) ? 1000000 : maxPrice]
        }
    }

    // travellers=2
    if(query.travellers) {
        customFilter.totalSeats = {
            [Op.gte]: query.travellers
        }
    }

    // sort=price_asc,departureTime_desc
    if(query.sort) {
        const params = query.sort.split(',');
        const sortFilters = params.map((param) => param.split('_'));
        sortFilter = sortFilters;
    }

    // ids=1,2,3
    if(query.ids) {
        const flightIds = query.ids.split(',').map(id => parseInt(id));
        customFilter.id = {
            [Op.in]: flightIds
        };
    }

    // Exclude past and landed departures for standard user search
    if (!query.ids) {
        if (!customFilter.departureTime) {
            customFilter.departureTime = {
                [Op.gte]: new Date()
            };
        }
        customFilter.status = {
            [Op.ne]: 'landed'
        };
    }

    try{
        const flights = await flightRepository.getAllFlights(customFilter, sortFilter);
        
        try {
            await RedisClient.set(cacheKey, JSON.stringify(flights), 'EX', 300);
            console.log("Cached flight search results in Redis.");
        } catch (redisErr) {
            console.error("Redis Cache Write Error:", redisErr);
        }
        
        return flights;
    }catch(error){
        throw new AppError(error.message || 'Cannot fetch the data of all the Flights', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function getFlight(id) {
    try {
        const flight = await flightRepository.get(id);
        return flight;
    } catch (error) {
        throw new AppError('Cannot fetch the data of the Flight', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateRemainingSeats(data) {
    try {
        const response = await flightRepository.updateRemainingSeats(data.flightId, data.seats, data.dec);
        await invalidateFlightCache();
        return response;
    } catch (error) {
        console.error(error);
        throw new AppError('Cannot update seats of the Flight', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function updateFlightStatus(flightId, status) {
    try {
        const flight = await flightRepository.get(flightId);
        flight.status = status;
        await flight.save();
        await invalidateFlightCache();
        return flight;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError('Cannot update flight status', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    createFlight,
    getAllFlights,
    getFlight,
    updateRemainingSeats,
    updateFlightStatus
};