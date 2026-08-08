const express = require("express");
const { BookingController } = require("../../controllers");
const { AuthMiddlewares } = require("../../middlewares");

const router = express.Router();

router.post("/", AuthMiddlewares.checkAuth, BookingController.createBooking);
router.post("/roundtrip", AuthMiddlewares.checkAuth, BookingController.createRoundTripBooking);
router.post("/payments", AuthMiddlewares.checkAuth, BookingController.makePayment);
router.post("/payments/roundtrip", AuthMiddlewares.checkAuth, BookingController.makeRoundTripPayment);
router.post("/:id/cancel", AuthMiddlewares.checkAuth, BookingController.cancelBooking);
router.get("/my-bookings", AuthMiddlewares.checkAuth, BookingController.getMyBookings);
router.get("/flights/:flightId/seats", BookingController.getFlightSeats);

module.exports = router;