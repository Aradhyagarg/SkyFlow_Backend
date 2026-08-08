const OutboxRepository = require('../../repositories/outbox-repository');
const { QueueConfig } = require('../../config');

const outboxRepository = new OutboxRepository();
let isProcessing = false;

async function processOutbox() {
    if (isProcessing) {
        return; // Prevent overlapping runs
    }
    isProcessing = true;

    try {
        const pendingEvents = await outboxRepository.getPendingEvents();
        if (pendingEvents.length === 0) {
            isProcessing = false;
            return;
        }

        console.log(`Outbox Worker: Found ${pendingEvents.length} pending events to publish.`);

        for (const event of pendingEvents) {
            try {
                // Publish payload directly to RabbitMQ
                await QueueConfig.sendData(event.payload);

                // Update status to processed
                await outboxRepository.update(event.id, { status: 'processed' });
                console.log(`Outbox Worker: Successfully processed event ID ${event.id}`);
            } catch (error) {
                console.error(`Outbox Worker: Failed to publish event ID ${event.id}. Error:`, error.message);
                // Keep status as pending so it retries in the next interval
            }
        }
    } catch (error) {
        console.error('Outbox Worker Error:', error);
    } finally {
        isProcessing = false;
    }
}

function startOutboxWorker() {
    console.log('Outbox Background Worker started successfully.');
    // Poll the outbox table every 5 seconds
    setInterval(processOutbox, 5000);
}

module.exports = startOutboxWorker;
