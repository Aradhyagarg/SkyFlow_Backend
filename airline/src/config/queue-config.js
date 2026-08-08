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
        console.log('Connected to RabbitMQ successfully (Consumer).');

        channel.consume('booking-cancellation-queue', async (msg) => {
            if (msg !== null) {
                try {
                    const data = JSON.parse(msg.content.toString());
                    console.log('Received seat restoration message from queue:', data);

                    const { FlightService } = require('../services');
                    await FlightService.updateRemainingSeats({
                        flightId: data.flightId,
                        seats: data.seats,
                        dec: data.dec
                    });

                    // Acknowledge upon successful DB update
                    channel.ack(msg);
                    console.log('Successfully processed and acknowledged seat restoration message.');
                } catch (error) {
                    console.error('Error processing queue message:', error);
                    
                    const headers = msg.properties.headers || {};
                    const retryCount = headers['x-retry-count'] || 0;

                    if (retryCount < 3) {
                        const nextRetryCount = retryCount + 1;
                        console.log(`Processing failed. Retrying (${nextRetryCount}/3)...`);
                        
                        // Publish back to the main queue with incremented retry header
                        channel.sendToQueue('booking-cancellation-queue', msg.content, {
                            headers: {
                                ...headers,
                                'x-retry-count': nextRetryCount
                            },
                            persistent: true
                        });
                        // Ack the current failing message so it is removed from the queue front
                        channel.ack(msg);
                    } else {
                        console.error('Message failed after 3 retries. Routing to Dead Letter Queue (DLQ).');
                        // Nack without requeue to route it to DLQ via DLX
                        channel.nack(msg, false, false);
                    }
                }
            }
        });
    } catch (error) {
        console.error('RabbitMQ Connection Error (Consumer):', error);
        throw error;
    }
}

module.exports = {
    connectQueue
};
