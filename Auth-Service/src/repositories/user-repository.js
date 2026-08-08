const CrudRepository = require('./crud-repository');
const { User } = require('../models');

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }

    async getUserByEmail(email) {
        const user = await User.findOne({ where: { email: email } });
        return user;
    }

    async getUserByVerificationToken(token) {
        const user = await User.findOne({ where: { verificationToken: token } });
        return user;
    }

    async getUserByResetToken(token) {
        const user = await User.findOne({ where: { resetPasswordToken: token } });
        return user;
    }
}

module.exports = UserRepository;
