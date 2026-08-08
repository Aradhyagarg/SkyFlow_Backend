const express = require("express");
const { FlightController } = require("../../controllers");
const { FlightMiddlewares, RateLimiter, AuthMiddlewares } = require("../../middlewares");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Flight:
 *       type: object
 *       required:
 *         - flightNumber
 *         - airplaneId
 *         - departureAirportId
 *         - arrivalAirportId
 *         - arrivalTime
 *         - departureTime
 *         - price
 *         - totalSeats
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the flight
 *         flightNumber:
 *           type: string
 *           description: The flight number
 *         airplaneId:
 *           type: integer
 *           description: ID of the airplane used for the flight
 *         departureAirportId:
 *           type: string
 *           description: IATA code of the departure airport
 *         arrivalAirportId:
 *           type: string
 *           description: IATA code of the arrival airport
 *         arrivalTime:
 *           type: string
 *           format: date-time
 *           description: Expected arrival time
 *         departureTime:
 *           type: string
 *           format: date-time
 *           description: Expected departure time
 *         price:
 *           type: integer
 *           description: Price of the flight ticket
 *         boardingGate:
 *           type: string
 *           description: Boarding gate number
 *         totalSeats:
 *           type: integer
 *           description: Total seats available in the flight
 *       example:
 *         flightNumber: UK 812
 *         airplaneId: 1
 *         departureAirportId: BLR
 *         arrivalAirportId: BOM
 *         arrivalTime: '2023-12-01T12:00:00.000Z'
 *         departureTime: '2023-12-01T10:00:00.000Z'
 *         price: 5500
 *         boardingGate: 12A
 *         totalSeats: 180
 */

/**
 * @swagger
 * tags:
 *   name: Flights
 *   description: The flights managing API
 */

/**
 * @swagger
 * /flights:
 *   post:
 *     summary: Create a new flight
 *     tags: [Flights]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Flight'
 *     responses:
 *       201:
 *         description: Successfully created a flight
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     summary: Get all flights
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: trips
 *         schema:
 *           type: string
 *         description: Search by departure and arrival airport (e.g. BLR-BOM)
 *     responses:
 *       200:
 *         description: Successfully fetched all flights
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /flights/{id}:
 *   get:
 *     summary: Get a flight by ID
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The flight id
 *     responses:
 *       200:
 *         description: Successfully fetched the flight
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /flights/{id}/seats:
 *   patch:
 *     summary: Update flight seats
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The flight id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seats:
 *                 type: integer
 *               dec:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successfully updated flight seats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", AuthMiddlewares.checkAuth, AuthMiddlewares.isAdmin, FlightMiddlewares.validateCreateRequest, FlightController.createFlight);
router.get("/", RateLimiter, FlightController.getAllFlights);
router.get("/:id", FlightController.getFlight);
router.patch("/:id/seats", FlightMiddlewares.validateUpdateSeatsRequest, FlightController.updateRemainingSeats);
router.patch("/:id/status", AuthMiddlewares.checkAuth, AuthMiddlewares.isAdmin, FlightMiddlewares.validateUpdateStatusRequest, FlightController.updateFlightStatus);

module.exports = router;