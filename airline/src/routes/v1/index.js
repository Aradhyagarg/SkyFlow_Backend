
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

// Cron trigger for flight lifecycle & automated flight generation
router.get('/cron/generate-flights', async (req, res) => {
    try {
        const { manageFlightLifecycle } = require('../../utils/common/cron-jobs');
        await manageFlightLifecycle();
        return res.status(200).json({
            success: true,
            message: 'Successfully generated flights and updated flight lifecycle',
            timestamp: new Date()
        });
    } catch (err) {
        console.error('Cron Execution Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to run flight lifecycle cron',
            error: err.message
        });
    }
});

module.exports = router;