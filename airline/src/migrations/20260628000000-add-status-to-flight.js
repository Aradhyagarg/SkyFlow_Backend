'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Flights', 'status', {
      type: Sequelize.ENUM('scheduled', 'delayed', 'boarding', 'departed', 'landed', 'cancelled'),
      defaultValue: 'scheduled',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Flights', 'status');
  }
};
