const axios = require("axios");
const { StatusCodes } = require('http-status-codes');
const BookingRepository = require("../repositories/booking-repository");
const db = require("../models");
const { ServerConfig } = require("../config");
const  AppError = require('../utils/errors/app-error');
const bookingRepository = new BookingRepository();
const {Enums} = require("../utils/common")
const {BOOKED, CANCELLED} = Enums.BOOKING_STATUS;

function generatePNR() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function generateUniquePNR(transaction = null) {
    let isUnique = false;
    let pnr = '';
    while (!isUnique) {
        pnr = generatePNR();
        const existing = await db.Booking.findOne({
            where: { pnr },
            transaction
        });
        if (!existing) {
            isUnique = true;
        }
    }
    return pnr;
}

function generateTicketNumber(index = 0) {
    return `TKT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-${index}`;
}

async function createBookingInternal(data, userId, transaction) {
    if (!data.passengers || !Array.isArray(data.passengers) || data.passengers.length === 0) {
        throw new AppError('Passenger details are required to make a booking', StatusCodes.BAD_REQUEST);
    }

    // Dynamically set noOfSeats based on number of passengers
    if (!data.noOfSeats) {
        data.noOfSeats = data.passengers.length;
    } else if (data.noOfSeats !== data.passengers.length) {
        throw new AppError('Number of seats must match the number of passengers provided', StatusCodes.BAD_REQUEST);
    }

    const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`, { timeout: 5000 });
    const flightData = flight.data.data;

    // Validate flight departure time and status
    const departureTime = new Date(flightData.departureTime);
    const currentTime = new Date();
    if (currentTime >= departureTime) {
        throw new AppError('Cannot book a flight that has already departed', StatusCodes.BAD_REQUEST);
    }
    if (flightData.status && ['landed', 'departed', 'cancelled'].includes(flightData.status.toLowerCase())) {
        throw new AppError(`Cannot book a flight that is already ${flightData.status}`, StatusCodes.BAD_REQUEST);
    }

    if(data.noOfSeats > flightData.totalSeats) {
        throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
    }

    const airplaneDetail = flightData.airplaneDetail;
    if (!airplaneDetail || !airplaneDetail.Seats) {
        throw new AppError('Flight seat configuration not found', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Build a map of valid physical seats for quick lookup
    const seatMap = {};
    airplaneDetail.Seats.forEach(seat => {
        const seatKey = `${seat.row}${seat.col}`.toUpperCase();
        seatMap[seatKey] = seat;
    });

    // Find all currently occupied seats on this flight
    const occupiedPassengerSeats = await db.Passenger.findAll({
        include: [
            {
                model: db.Booking,
                as: 'booking',
                where: {
                    flightId: data.flightId,
                    status: {
                        [db.Sequelize.Op.ne]: CANCELLED
                    }
                }
            }
        ],
        transaction
    });
    const occupiedSeats = new Set(occupiedPassengerSeats.map(p => p.seatNumber.toUpperCase()));

    const newBookingSeats = new Set();
    let totalBillingAmount = 0;

    for (const passenger of data.passengers) {
        if (!passenger.seatNumber) {
            throw new AppError('Seat number is required for all passengers', StatusCodes.BAD_REQUEST);
        }
        const seatNumberUpper = passenger.seatNumber.toUpperCase();

        // Validate seat existence
        const physicalSeat = seatMap[seatNumberUpper];
        if (!physicalSeat) {
            throw new AppError(`Seat ${passenger.seatNumber} does not exist on this flight's airplane`, StatusCodes.BAD_REQUEST);
        }

        // Validate seat vacancy
        if (occupiedSeats.has(seatNumberUpper)) {
            throw new AppError(`Seat ${passenger.seatNumber} is already booked`, StatusCodes.BAD_REQUEST);
        }

        // Validate duplicate seat selection in this request
        if (newBookingSeats.has(seatNumberUpper)) {
            throw new AppError(`Seat ${passenger.seatNumber} is selected multiple times in this booking`, StatusCodes.BAD_REQUEST);
        }
        newBookingSeats.add(seatNumberUpper);

        // Calculate class-based pricing
        let passengerPrice = flightData.price;
        if (physicalSeat.type === 'premium-economy') {
            passengerPrice = Math.round(flightData.price * 1.4);
        } else if (physicalSeat.type === 'business') {
            passengerPrice = Math.round(flightData.price * 2.0);
        } else if (physicalSeat.type === 'first-class') {
            passengerPrice = Math.round(flightData.price * 3.0);
        }

        // Add ancillary/add-on charges
        if (passenger.hasExtraBaggage) {
            passengerPrice += 1000;
        }
        if (passenger.hasMeal) {
            passengerPrice += 350;
        }
        if (passenger.hasInsurance) {
            passengerPrice += 299;
        }

        totalBillingAmount += passengerPrice;
    }

    const pnr = await generateUniquePNR(transaction);
    const bookingPayload = {...data, userId, totalCost: totalBillingAmount, pnr};
    const booking = await bookingRepository.create(bookingPayload, transaction);

    // Bulk create passenger records associated with this booking
    const PassengerRepository = require("../repositories/passenger-repository");
    const passengerRepository = new PassengerRepository();
    const passengerPayloads = data.passengers.map((p, idx) => {
        const seatNumberUpper = p.seatNumber.toUpperCase();
        const physicalSeat = seatMap[seatNumberUpper];
        return {
            ...p,
            seatNumber: seatNumberUpper,
            seatType: physicalSeat.type,
            hasExtraBaggage: !!p.hasExtraBaggage,
            hasMeal: !!p.hasMeal,
            hasInsurance: !!p.hasInsurance,
            bookingId: booking.id,
            ticketNumber: generateTicketNumber(idx)
        };
    });
    await passengerRepository.bulkCreate(passengerPayloads, transaction);

    await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
        seats: data.noOfSeats
    }, { timeout: 5000 });

    const fullBooking = await bookingRepository.get(booking.id, transaction);
    return fullBooking;
}

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const booking = await createBookingInternal(data, data.userId, transaction);
        await transaction.commit();
        return booking;
    } catch(error) {
        await transaction.rollback();
        throw error;
    }
}

async function createRoundTripBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        if (!data.outbound || !data.return) {
            throw new AppError('Outbound and Return flight details are required to make a round-trip booking', StatusCodes.BAD_REQUEST);
        }

        const outboundBooking = await createBookingInternal(data.outbound, data.userId, transaction);
        const returnBooking = await createBookingInternal(data.return, data.userId, transaction);

        await transaction.commit();
        return {
            outboundBooking,
            returnBooking,
            totalCost: outboundBooking.totalCost + returnBooking.totalCost
        };
    } catch(error) {
        await transaction.rollback();
        throw error;
    }
}

async function makePayment(data){
    const transaction = await db.sequelize.transaction();
    try{
        const bookingDetails = await bookingRepository.get(
            data.bookingId,
            transaction
        );

        if (bookingDetails.status === CANCELLED) {
            throw new AppError(
                'The booking has expired',
                StatusCodes.BAD_REQUEST
            );
        }
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();

        if (currentTime - bookingTime > 1200000) {
            await cancelBooking(
                data.bookingId
            );
            throw new AppError(
                'The booking has expired',
                StatusCodes.BAD_REQUEST
            );
        }
        if(bookingDetails.totalCost != data.totalCost){
            throw new AppError('The amount of the payment does not match', StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.userId != data.userId){
            throw new AppError('The user corresponding to the booking does not match', StatusCodes.BAD_REQUEST);
        }
        const response = await bookingRepository.update(data.bookingId, {status: BOOKED, paymentMethod: data.paymentMethod}, transaction);
        await transaction.commit();
        return response;
    }catch(error){
        await transaction.rollback();
        throw error;
    }
}

async function makeRoundTripPayment(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const outboundBooking = await bookingRepository.get(data.outboundBookingId, transaction);
        const returnBooking = await bookingRepository.get(data.returnBookingId, transaction);

        if (outboundBooking.status === CANCELLED || returnBooking.status === CANCELLED) {
            throw new AppError('One of the bookings has expired', StatusCodes.BAD_REQUEST);
        }

        const currentTime = new Date();
        const outboundTime = new Date(outboundBooking.createdAt);
        const returnTime = new Date(returnBooking.createdAt);

        if (currentTime - outboundTime > 1200000) {
            await cancelBooking(data.outboundBookingId);
            throw new AppError('Outbound booking has expired', StatusCodes.BAD_REQUEST);
        }
        if (currentTime - returnTime > 1200000) {
            await cancelBooking(data.returnBookingId);
            throw new AppError('Return booking has expired', StatusCodes.BAD_REQUEST);
        }

        const combinedCost = outboundBooking.totalCost + returnBooking.totalCost;
        if (Number(data.totalCost) !== combinedCost) {
            throw new AppError('The payment amount does not match the round-trip combined cost', StatusCodes.BAD_REQUEST);
        }

        if (outboundBooking.userId != data.userId || returnBooking.userId != data.userId) {
            throw new AppError('The user corresponding to the bookings does not match', StatusCodes.BAD_REQUEST);
        }

        // Update status of both bookings to BOOKED
        await bookingRepository.update(data.outboundBookingId, { status: BOOKED, paymentMethod: data.paymentMethod }, transaction);
        await bookingRepository.update(data.returnBookingId, { status: BOOKED, paymentMethod: data.paymentMethod }, transaction);

        await transaction.commit();
        
        // Retrieve and return fully updated details
        const updatedOutbound = await bookingRepository.get(data.outboundBookingId);
        const updatedReturn = await bookingRepository.get(data.returnBookingId);

        return {
            outbound: updatedOutbound,
            return: updatedReturn
        };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelBooking(bookingId){
    const transaction = await db.sequelize.transaction();
    try{
        const bookingDetails = await bookingRepository.get(
            bookingId,
            transaction
        );
        if(bookingDetails.status === CANCELLED){
            await transaction.commit();
            return true;
        }
        const OutboxRepository = require('../repositories/outbox-repository');
        const outboxRepository = new OutboxRepository();
        await outboxRepository.create({
            eventType: 'booking.cancelled',
            payload: {
                flightId: bookingDetails.flightId,
                seats: bookingDetails.noOfSeats,
                dec: 0
            }
        }, transaction);
        await bookingRepository.update(
            bookingId,
            { status: CANCELLED },
            transaction
        );
        await transaction.commit();
    }catch(error){
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBookings(){
    try{
        const time = new Date(Date.now() - 1000 * 1200);
        const bookings = await bookingRepository.cancelOldBooking(time);
        for (const booking of bookings) {
            try {
                await cancelBooking(booking.id);
            } catch (err) {
                console.error(`Failed to cancel booking ID ${booking.id}:`, err);
            }
        }
        return bookings;
    }catch(error){
        console.log(error);
    }
}

async function getFlightSeats(flightId) {
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${flightId}`, { timeout: 5000 });
        const flightData = flight.data.data;
        const airplaneDetail = flightData.airplaneDetail;
        if (!airplaneDetail || !airplaneDetail.Seats) {
            throw new AppError('Flight seat configuration not found', StatusCodes.INTERNAL_SERVER_ERROR);
        }

        const occupiedPassengerSeats = await db.Passenger.findAll({
            include: [
                {
                    model: db.Booking,
                    as: 'booking',
                    where: {
                        flightId: flightId,
                        status: {
                            [db.Sequelize.Op.ne]: CANCELLED
                        }
                    }
                }
            ]
        });
        const occupiedSeats = new Set(occupiedPassengerSeats.map(p => p.seatNumber.toUpperCase()));

        const seatMap = airplaneDetail.Seats.map(seat => {
            const seatKey = `${seat.row}${seat.col}`.toUpperCase();
            return {
                id: seat.id,
                row: seat.row,
                col: seat.col,
                type: seat.type,
                seatNumber: seatKey,
                isBooked: occupiedSeats.has(seatKey)
            };
        });

        return seatMap;
    } catch(error) {
        throw error;
    }
}

async function getMyBookings(userId) {
    try {
        const bookings = await db.Booking.findAll({
            where: { userId },
            include: [
                {
                    model: db.Passenger,
                    as: 'passengers'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (bookings.length === 0) {
            return { upcoming: [], past: [] };
        }

        const flightIds = [...new Set(bookings.map(b => b.flightId))];

        const response = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights`, {
            params: { ids: flightIds.join(",") },
            timeout: 5000
        });
        const flights = response.data.data;
        const flightMap = {};
        flights.forEach(f => {
            flightMap[f.id] = f;
        });

        const upcoming = [];
        const past = [];
        const now = new Date();

        bookings.forEach(booking => {
            const flight = flightMap[booking.flightId];
            const bookingWithFlight = {
                ...booking.toJSON(),
                flightDetails: flight || null
            };

            if (flight) {
                const departureTime = new Date(flight.departureTime);
                if (departureTime > now && booking.status !== CANCELLED) {
                    upcoming.push(bookingWithFlight);
                } else {
                    past.push(bookingWithFlight);
                }
            } else {
                past.push(bookingWithFlight);
            }
        });

        return { upcoming, past };
    } catch(error) {
        throw error;
    }
}

module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
  cancelOldBookings,
  getFlightSeats,
  getMyBookings,
  createRoundTripBooking,
  makeRoundTripPayment
};