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
    totalSeats: Joi.number().integer().min(0).required(),
    status: Joi.string().valid('scheduled', 'delayed', 'boarding', 'departed', 'landed', 'cancelled')
}).custom((obj, helpers) => {
    if (new Date(obj.arrivalTime) <= new Date(obj.departureTime)) {
        return helpers.message('Arrival time must be after departure time');
    }
    return obj;
});

const seatUpdateSchema = Joi.object({
    seats: Joi.number().integer().min(1).required(),
    dec: Joi.any()
});

const flightStatusUpdateSchema = Joi.object({
    status: Joi.string().valid('scheduled', 'delayed', 'boarding', 'departed', 'landed', 'cancelled').required()
});

module.exports = {
    airplaneSchema,
    airportSchema,
    citySchema,
    flightSchema,
    seatUpdateSchema,
    flightStatusUpdateSchema
};
