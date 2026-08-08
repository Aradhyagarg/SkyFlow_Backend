const express = require("express");
const { AirplaneController } = require("../../controllers");
const { AirplaneMiddlewares, AuthMiddlewares } = require("../../middlewares")

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Airplane:
 *       type: object
 *       required:
 *         - modelNumber
 *         - capacity
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the airplane
 *         modelNumber:
 *           type: string
 *           description: The model number of the airplane
 *         capacity:
 *           type: integer
 *           description: The seating capacity of the airplane
 *       example:
 *         id: 1
 *         modelNumber: Boeing 737
 *         capacity: 180
 */

/**
 * @swagger
 * tags:
 *   name: Airplanes
 *   description: The airplanes managing API
 */

/**
 * @swagger
 * /airplanes:
 *   post:
 *     summary: Create a new airplane
 *     tags: [Airplanes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Airplane'
 *     responses:
 *       201:
 *         description: Successfully created an airplane
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
router.post("/", AuthMiddlewares.checkAuth, AuthMiddlewares.isAdmin, AirplaneMiddlewares.validateCreateRequest, AirplaneController.createAirplane);

/**
 * @swagger
 * /airplanes:
 *   get:
 *     summary: Returns the list of all airplanes
 *     tags: [Airplanes]
 *     responses:
 *       200:
 *         description: Successfully fetched all airplanes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get("/", AirplaneController.getAirplanes);

/**
 * @swagger
 * /airplanes/{id}:
 *   get:
 *     summary: Get airplane by id
 *     tags: [Airplanes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The airplane id
 *     responses:
 *       200:
 *         description: Successfully fetched the airplane
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Airplane not found
 */
router.get("/:id", AirplaneController.getAirplane);

/**
 * @swagger
 * /airplanes/{id}:
 *   delete:
 *     summary: Delete an airplane by id
 *     tags: [Airplanes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The airplane id
 *     responses:
 *       200:
 *         description: Successfully deleted the airplane
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.delete("/:id", AirplaneController.destroyAirplane);

module.exports = router;