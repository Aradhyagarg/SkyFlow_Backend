const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '2ap4BcnJ44QKDga.root',
  password: 'TxrjQ4WWe1iMpd5y',
  database: 'Flights',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Failed to connect:', err);
    process.exit(1);
  }
  connection.query('ALTER TABLE Bookings DROP COLUMN pnr;', (err) => {
    if (err) {
      console.log('Error dropping column:', err.message);
    } else {
      console.log('Column pnr dropped successfully!');
    }
    connection.end();
  });
});
