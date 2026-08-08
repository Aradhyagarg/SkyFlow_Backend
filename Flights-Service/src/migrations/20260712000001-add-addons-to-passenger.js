'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Passengers', 'hasExtraBaggage', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await queryInterface.addColumn('Passengers', 'hasMeal', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await queryInterface.addColumn('Passengers', 'hasInsurance', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Passengers', 'hasExtraBaggage');
    await queryInterface.removeColumn('Passengers', 'hasMeal');
    await queryInterface.removeColumn('Passengers', 'hasInsurance');
  }
};
