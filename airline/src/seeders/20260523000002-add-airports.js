'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Airports', [
      {
        id: 1,
        name: 'Indira Gandhi International Airport',
        code: 'DEL',
        address: 'New Delhi, Delhi 110037',
        cityId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Chhatrapati Shivaji Maharaj International Airport',
        code: 'BOM',
        address: 'Mumbai, Maharashtra 400099',
        cityId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Kempegowda International Airport',
        code: 'BLR',
        address: 'Devanahalli, Bengaluru, Karnataka 560300',
        cityId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Heathrow Airport',
        code: 'LHR',
        address: 'Longford TW6, United Kingdom',
        cityId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'John F. Kennedy International Airport',
        code: 'JFK',
        address: 'Queens, NY 11430, United States',
        cityId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Airports', null, {});
  }
};
