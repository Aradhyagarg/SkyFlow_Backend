const { BookingService } = require("../services");
const { SuccessResponse } = require("../utils/common");
const { StatusCodes } = require("http-status-codes");
const { RedisClient } = require("../config");

async function createBooking(req, res, next) {
  try {
    const response = await BookingService.createBooking({
      flightId: req.body.flightId,
      userId: req.user,
      noOfSeats: req.body.noOfSeats,
      passengers: req.body.passengers
    });
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully create booking for flights";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

async function makePayment(req, res, next) {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"];
    if (!idempotencyKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "idempotency key missing" });
    }

    const userId = req.user;

    const exists = await RedisClient.get(`idempotency:${userId}:${idempotencyKey}`);
    if (exists) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Cannot retry on successful payment" });
    }

    const response = await BookingService.makePayment({
      totalCost: req.body.totalCost,
      userId: userId,
      bookingId: req.body.bookingId,
      paymentMethod: req.body.paymentMethod
    });

    // Cache the idempotency key in Redis with a 24-hour TTL (86400 seconds)
    await RedisClient.set(`idempotency:${userId}:${idempotencyKey}`, "true", "EX", 86400);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully make the payment";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const response = await BookingService.cancelBooking(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully cancelled booking";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

async function getFlightSeats(req, res, next) {
  try {
    const response = await BookingService.getFlightSeats(req.params.flightId);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched seat map for the flight";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const response = await BookingService.getMyBookings(req.user);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched bookings for the user";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

async function createRoundTripBooking(req, res, next) {
  try {
    const response = await BookingService.createRoundTripBooking({
      outbound: {
        flightId: req.body.outbound.flightId,
        passengers: req.body.outbound.passengers,
        noOfSeats: req.body.outbound.passengers.length
      },
      return: {
        flightId: req.body.return.flightId,
        passengers: req.body.return.passengers,
        noOfSeats: req.body.return.passengers.length
      },
      userId: req.user
    });
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully created round-trip bookings";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

async function makeRoundTripPayment(req, res, next) {
  try {
    const idempotencyKey = req.headers["x-idempotency-key"];
    if (!idempotencyKey) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "idempotency key missing" });
    }

    const userId = req.user;

    const exists = await RedisClient.get(`idempotency:${userId}:${idempotencyKey}`);
    if (exists) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Cannot retry on successful payment" });
    }

    const response = await BookingService.makeRoundTripPayment({
      totalCost: req.body.totalCost,
      userId: userId,
      outboundBookingId: req.body.outboundBookingId,
      returnBookingId: req.body.returnBookingId,
      paymentMethod: req.body.paymentMethod
    });

    await RedisClient.set(`idempotency:${userId}:${idempotencyKey}`, "true", "EX", 86400);

    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully processed round-trip payment";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  makePayment,
  cancelBooking,
  getFlightSeats,
  getMyBookings,
  createRoundTripBooking,
  makeRoundTripPayment
};
