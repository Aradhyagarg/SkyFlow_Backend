'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Flights', [
      {
        id: 1,
        flightNumber: 'DEL-101',
        airplaneId: 1,
        departureAirportId: 'DEL',
        arrivalAirportId: 'BOM',
        departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
        arrivalTime: new Date(Date.now() + 26 * 60 * 60 * 1000),  // tomorrow + 2 hrs
        price: 5500,
        boardingGate: 'Gate A2',
        totalSeats: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        flightNumber: 'BOM-202',
        airplaneId: 2,
        departureAirportId: 'BOM',
        arrivalAirportId: 'BLR',
        departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
        arrivalTime: new Date(Date.now() + 50 * 60 * 60 * 1000),  // 2 days + 2 hrs
        price: 4200,
        boardingGate: 'Gate B5',
        totalSeats: 180,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        flightNumber: 'JFK-303',
        airplaneId: 1,
        departureAirportId: 'JFK',
        arrivalAirportId: 'LHR',
        departureTime: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days from now
        arrivalTime: new Date(Date.now() + 80 * 60 * 60 * 1000),  // 3 days + 8 hrs
        price: 45000,
        boardingGate: 'Gate C12',
        totalSeats: 120,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Flights', null, {});
  }
};
