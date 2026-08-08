const cron = require('node-cron');
const startOutboxWorker = require('./outbox-worker');

function scheduleCrons(){

    cron.schedule('*/5 * * * *', async () => {
        const { BookingService } = require('../../services');

        const response = await BookingService.cancelOldBookings();

        console.log(response);

    });

    startOutboxWorker();
}

module.exports = scheduleCrons;