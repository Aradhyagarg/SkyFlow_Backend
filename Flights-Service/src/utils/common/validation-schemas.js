const Joi = require('joi');

const airplaneSchema = Joi.object({
    modelNumber: Joi.string().required(),
    capacity: Joi.number().integer().min(0).max(1000).required()
});

const airportSchema = Joi.object({
    name: Joi.string().required(),
    code: Joi.string().length(3).uppercase().required(),
    address: Joi.string(),
    cityId: Joi.number().integer().required()
});

const citySchema = Joi.object({
    name: Joi.string().required().min(2).max(50)
});

const flightSchema = Joi.object({
    flightNumber: Joi.string().required(),
    airplaneId: Joi.number().integer().required(),
    departureAirportId: Joi.string().length(3).uppercase().required(),
    arrivalAirportId: Joi.string().length(3).uppercase().required(),
    arrivalTime: Joi.date().iso().required(),
    departureTime: Joi.date().iso().required(),
    price: Joi.number().min(0).required(),
    boardingGate: Joi.string(),
    totalSeats: Joi.number().integer().min(0).required()
}).custom((obj, helpers) => {
    if (new Date(obj.arrivalTime) <= new Date(obj.departureTime)) {
        return helpers.message('Arrival time must be after departure time');
    }
    return obj;
});

module.exports = {
    airplaneSchema,
    airportSchema,
    citySchema,
    flightSchema
};
