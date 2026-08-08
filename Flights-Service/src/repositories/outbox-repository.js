const CrudRepository = require('./crud-repository');

class OutboxRepository extends CrudRepository {
    constructor() {
        const { Outbox } = require('../models');
        super(Outbox);
    }

    async getPendingEvents(transaction = null) {
        const { Outbox } = require('../models');
        const events = await Outbox.findAll({
            where: { status: 'pending' },
            transaction: transaction
        });
        return events;
    }
}

module.exports = OutboxRepository;
