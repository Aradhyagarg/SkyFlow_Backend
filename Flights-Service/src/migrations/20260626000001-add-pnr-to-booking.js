'use strict';

function generateRandomPNR() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add column as nullable first to prevent errors with existing rows
    await queryInterface.addColumn('Bookings', 'pnr', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. Populate existing bookings with unique random PNRs
    const [bookings] = await queryInterface.sequelize.query('SELECT id FROM Bookings');
    for (const booking of bookings) {
      let isUnique = false;
      let pnr = '';
      while (!isUnique) {
        pnr = generateRandomPNR();
        const [existing] = await queryInterface.sequelize.query(`SELECT id FROM Bookings WHERE pnr = '${pnr}'`);
        if (existing.length === 0) {
          isUnique = true;
        }
      }
      await queryInterface.sequelize.query(`UPDATE Bookings SET pnr = '${pnr}' WHERE id = ${booking.id}`);
    }

    // 3. Change column to be non-nullable
    await queryInterface.changeColumn('Bookings', 'pnr', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // 4. Add unique index separately to support TiDB/MySQL
    await queryInterface.addIndex('Bookings', ['pnr'], {
      unique: true,
      name: 'unique_pnr_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bookings', 'pnr');
  }
};
