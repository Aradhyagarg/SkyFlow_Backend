const CrudRepository = require('./crud-repository');

class PassengerRepository extends CrudRepository {
    constructor() {
        const { Passenger } = require('../models');
        super(Passenger);
    }

    async bulkCreate(data, transaction) {
        const { Passenger } = require('../models');
        const response = await Passenger.bulkCreate(data, { transaction });
        return response;
    }
}

module.exports = PassengerRepository;
