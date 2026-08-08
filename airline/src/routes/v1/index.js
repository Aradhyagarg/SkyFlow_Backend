
const express = require('express');
const router = express.Router();
const { InfoController } = require('../../controllers'); 
const airplaneRoutes = require("./airplane-routes");
const cityRoutes = require("./city-routes");
const airportRoutes = require("./airport-routes");
const flightRoutes = require("./flight-routes");

router.use('/airplanes', airplaneRoutes);
router.use('/cities', cityRoutes);
router.use('/airports', airportRoutes);
router.use('/flights', flightRoutes);

/**
 * @swagger
 * /info:
 *   get:
 *     summary: API Information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Successfully fetched API info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.get('/info', InfoController.info);

module.exports = router;