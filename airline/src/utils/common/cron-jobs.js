const cron = require('node-cron');
const { Op } = require('sequelize');
const { Flight, Airplane, Airport, City, Seat } = require('../../models');
const { RedisClient } = require('../../config');

async function invalidateFlightCache() {
    try {
        const stream = RedisClient.scanStream({
            match: 'flights_search:*',
            count: 100
        });
        
        stream.on('data', async (keys) => {
            if (keys.length > 0) {
                const pipeline = RedisClient.pipeline();
                keys.forEach(key => pipeline.del(key));
                await pipeline.exec();
            }
        });
        console.log("Successfully triggered flight search cache invalidation from cron.");
    } catch (err) {
        console.error("Failed to invalidate flight cache in cron:", err);
    }
}

async function seedDataIfNeeded() {
    try {
        // 1. Seed Cities if none exist
        const cityCount = await City.count();
        if (cityCount === 0) {
            console.log('Seeding initial domestic cities...');
            await City.bulkCreate([
                { id: 1, name: 'Delhi' },
                { id: 2, name: 'Mumbai' },
                { id: 3, name: 'Bengaluru' },
                { id: 4, name: 'Chennai' },
                { id: 5, name: 'Kolkata' }
            ]);
        }

        // 2. Seed Airports if none exist
        const airportCount = await Airport.count();
        if (airportCount === 0) {
            console.log('Seeding initial domestic airports...');
            await Airport.bulkCreate([
                { code: 'DEL', name: 'Indira Gandhi International Airport', cityId: 1, address: 'New Delhi' },
                { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', cityId: 2, address: 'Mumbai' },
                { code: 'BLR', name: 'Kempegowda International Airport', cityId: 3, address: 'Bengaluru' },
                { code: 'MAA', name: 'Chennai International Airport', cityId: 4, address: 'Chennai' },
                { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', cityId: 5, address: 'Kolkata' }
            ]);
        }

        // 3. Ensure Airplanes exist
        let airplanes = await Airplane.findAll();
        if (airplanes.length === 0) {
            console.log('Seeding initial airplanes...');
            airplanes = await Airplane.bulkCreate([
                { modelNumber: 'Boeing 737', capacity: 120 },
                { modelNumber: 'Airbus A320', capacity: 180 },
                { modelNumber: 'Boeing 777', capacity: 300 }
            ]);
        }

        // 4. Ensure physical seats match airplane capacity
        for (const plane of airplanes) {
            const currentSeatCount = await Seat.count({
                where: { airplaneId: plane.id }
            });

            if (currentSeatCount !== plane.capacity) {
                console.log(`Seat count mismatch for ${plane.modelNumber} (Got ${currentSeatCount}, Expected ${plane.capacity}). Regenerating seats...`);
                // Clear any partial/old seats
                await Seat.destroy({
                    where: { airplaneId: plane.id }
                });

                const seatPayloads = [];
                const numRows = Math.ceil(plane.capacity / 6);
                
                for (let r = 1; r <= numRows; r++) {
                    // Row classification
                    let type = 'economy';
                    if (r <= Math.ceil(numRows * 0.1)) {
                        type = 'first-class';
                    } else if (r <= Math.ceil(numRows * 0.25)) {
                        type = 'business';
                    } else if (r <= Math.ceil(numRows * 0.4)) {
                        type = 'premium-economy';
                    }

                    ['A', 'B', 'C', 'D', 'E', 'F'].forEach(c => {
                        seatPayloads.push({
                            airplaneId: plane.id,
                            row: r,
                            col: c,
                            type
                        });
                    });
                }
                await Seat.bulkCreate(seatPayloads);
                console.log(`Successfully generated ${plane.capacity} seats for ${plane.modelNumber}.`);
            }
        }
    } catch (error) {
        console.error('Error during data seeding:', error);
    }
}

async function manageFlightLifecycle() {
    console.log('Running daily Flight Lifecycle Management Task...');
    try {
        await seedDataIfNeeded();

        // Task A: Mark yesterday's departures as LANDED
        const now = new Date();
        const [updatedRowsCount] = await Flight.update(
            { status: 'landed' },
            {
                where: {
                    departureTime: { [Op.lt]: now },
                    status: { [Op.notIn]: ['landed', 'cancelled'] }
                }
            }
        );
        if (updatedRowsCount > 0) {
            console.log(`Successfully updated ${updatedRowsCount} past flights to LANDED.`);
            await invalidateFlightCache();
        }

        // Task B: Generate 10-15 domestic flights daily for each of the next 10 days (D+1 to D+10)
        const airplanes = await Airplane.findAll();
        const airportRecords = await Airport.findAll();
        const airports = airportRecords.map(a => a.code);
        const carrierCodes = ['AI', '6E', 'UK', 'QP', 'SG']; // Air India, IndiGo, Vistara, Akasa, SpiceJet

        if (airplanes.length === 0 || airports.length < 2) {
            console.log('Cannot generate flights: not enough airplanes or airports available.');
            return;
        }

        for (let dayOffset = 1; dayOffset <= 10; dayOffset++) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + dayOffset);
            
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            // Check if flights exist for this day
            const existingCount = await Flight.count({
                where: {
                    departureTime: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            });

            if (existingCount > 0) {
                // Already has flights generated, skip this day
                continue;
            }

            console.log(`Generating domestic flights for date: ${startOfDay.toDateString()}...`);

            const flightsToCreate = [];
            const numFlights = Math.floor(10 + Math.random() * 6); // 10 to 15 flights

            for (let i = 0; i < numFlights; i++) {
                const airplane = airplanes[Math.floor(Math.random() * airplanes.length)];
                
                const departureAirportId = airports[Math.floor(Math.random() * airports.length)];
                let arrivalAirportId = departureAirportId;
                while (arrivalAirportId === departureAirportId) {
                    arrivalAirportId = airports[Math.floor(Math.random() * airports.length)];
                }

                // Random departure hour (6 AM to 9 PM)
                const departureHour = Math.floor(6 + Math.random() * 16);
                const departureMin = Math.floor(Math.random() * 4) * 15;
                
                const depTime = new Date(startOfDay);
                depTime.setHours(departureHour, departureMin, 0, 0);

                // Flight duration = 2 or 3 hours
                const flightDurationHours = Math.floor(2 + Math.random() * 2);
                const arrTime = new Date(depTime);
                arrTime.setHours(arrTime.getHours() + flightDurationHours);

                const price = Math.floor(30 + Math.random() * 61) * 100; // 3000 to 9000
                const carrier = carrierCodes[Math.floor(Math.random() * carrierCodes.length)];
                const flightNum = `${carrier}-${Math.floor(100 + Math.random() * 900)}`;

                flightsToCreate.push({
                    flightNumber: flightNum,
                    airplaneId: airplane.id,
                    departureAirportId,
                    arrivalAirportId,
                    arrivalTime: arrTime,
                    departureTime: depTime,
                    price,
                    boardingGate: `G${Math.floor(1 + Math.random() * 20)}`,
                    totalSeats: airplane.capacity,
                    status: 'scheduled'
                });
            }

            await Flight.bulkCreate(flightsToCreate);
            console.log(`Generated ${numFlights} domestic flights for ${startOfDay.toDateString()}.`);
        }

        await invalidateFlightCache();
    } catch (error) {
        console.error('Error during flight generation cron:', error);
    }
}

function initFlightCron() {
    // Run hourly at the start of every hour
    cron.schedule('0 * * * *', async () => {
        await manageFlightLifecycle();
    });

    // Run on startup to seed and bootstrap flights
    manageFlightLifecycle();
}

module.exports = initFlightCron;
