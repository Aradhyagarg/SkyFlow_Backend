'use strict';

function generateRandomTicketNumber() {
  return 'TKT-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add column as nullable first to prevent errors with existing rows
    await queryInterface.addColumn('Passengers', 'ticketNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. Populate existing passengers with unique ticket numbers
    const [passengers] = await queryInterface.sequelize.query('SELECT id FROM Passengers');
    for (const passenger of passengers) {
      const ticketNumber = generateRandomTicketNumber();
      await queryInterface.sequelize.query(`UPDATE Passengers SET ticketNumber = '${ticketNumber}' WHERE id = ${passenger.id}`);
    }

    // 3. Change column to be non-nullable
    await queryInterface.changeColumn('Passengers', 'ticketNumber', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // 4. Add unique index separately to support TiDB/MySQL
    await queryInterface.addIndex('Passengers', ['ticketNumber'], {
      unique: true,
      name: 'unique_ticketNumber_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Passengers', 'ticketNumber');
  }
};
