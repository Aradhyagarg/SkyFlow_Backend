const express = require("express");
const { AirportController } = require("../../controllers");
const { AirportMiddlewares, AuthMiddlewares } = require("../../middlewares")

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Airport:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - cityId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the airport
 *         name:
 *           type: string
 *           description: The name of the airport
 *         code:
 *           type: string
 *           description: The unique IATA code of the airport
 *         address:
 *           type: string
 *           description: The physical address of the airport
 *         cityId:
 *           type: integer
 *           description: The id of the city the airport belongs to
 *       example:
 *         id: 1
 *         name: Kempegowda International Airport
 *         code: BLR
 *         address: Devanahalli, Bengaluru
 *         cityId: 1
 */

/**
 * @swagger
 * tags:
 *   name: Airports
 *   description: The airports managing API
 */

/**
 * @swagger
 * /airports:
 *   post:
 *     summary: Create a new airport
 *     tags: [Airports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Airport'
 *     responses:
 *       201:
 *         description: Successfully created an airport
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
 */
router.post("/", AuthMiddlewares.checkAuth, AuthMiddlewares.isAdmin, AirportMiddlewares.validateCreateRequest, AirportController.createAirport);

/**
 * @swagger
 * /airports:
 *   get:
 *     summary: Returns the list of all airports
 *     tags: [Airports]
 *     responses:
 *       200:
 *         description: Successfully fetched all airports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get("/", AirportController.getAirports);

/**
 * @swagger
 * /airports/{id}:
 *   get:
 *     summary: Get airport by id
 *     tags: [Airports]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The airport id
 *     responses:
 *       200:
 *         description: Successfully fetched the airport
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Airport not found
 */
router.get("/:id", AirportController.getAirport);

/**
 * @swagger
 * /airports/{id}:
 *   delete:
 *     summary: Delete an airport by id
 *     tags: [Airports]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The airport id
 *     responses:
 *       200:
 *         description: Successfully deleted the airport
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete("/:id", AirportController.destroyAirport);

module.exports = router;