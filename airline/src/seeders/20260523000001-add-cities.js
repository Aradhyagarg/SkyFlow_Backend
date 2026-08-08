'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Cities', [
      {
        id: 1,
        name: 'Delhi',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Mumbai',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Bengaluru',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'London',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'New York',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cities', null, {});
  }
};
