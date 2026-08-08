const amqplib = require('amqplib');

let channel, connection;

async function connectQueue() {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        connection = await amqplib.connect(rabbitmqUrl);
        channel = await connection.createChannel();

        // Assert Dead Letter Exchange & Queue
        await channel.assertExchange('booking-dlx', 'direct', { durable: true });
        await channel.assertQueue('booking-dlq', { durable: true });
        await channel.bindQueue('booking-dlq', 'booking-dlx', 'booking-dead-letter');

        // Assert Main Queue with DLX arguments
        await channel.assertQueue('booking-cancellation-queue', { 
            durable: true,
            arguments: {
                'x-dead-letter-exchange': 'booking-dlx',
                'x-dead-letter-routing-key': 'booking-dead-letter'
            }
        });
        console.log('Connected to RabbitMQ successfully (Publisher).');
    } catch (error) {
        console.error('RabbitMQ Connection Error (Publisher):', error);
        throw error;
    }
}

async function sendData(data) {
    try {
        if (!channel) {
            await connectQueue();
        }
        await channel.sendToQueue('booking-cancellation-queue', Buffer.from(JSON.stringify(data)), { persistent: true });
        console.log('Message sent to queue successfully:', data);
    } catch (error) {
        console.error('Error in sending message to queue:', error);
        throw error;
    }
}

module.exports = {
    connectQueue,
    sendData
};
