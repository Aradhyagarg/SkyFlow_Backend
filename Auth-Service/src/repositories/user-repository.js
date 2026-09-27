const CrudRepository = require('./crud-repository');
const { User } = require('../models');

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }

    async getUserByEmail(email) {
        const cleanEmail = email ? email.trim() : '';
        let user = await User.findOne({ where: { email: cleanEmail }, paranoid: false });
        if (!user) {
            user = await User.findOne({ where: { email: cleanEmail.toLowerCase() }, paranoid: false });
        }
        return user;
    }

    async getUserByVerificationToken(token) {
        const user = await User.findOne({ where: { verificationToken: token }, paranoid: false });
        return user;
    }

    async getUserByResetToken(token) {
        const user = await User.findOne({ where: { resetPasswordToken: token }, paranoid: false });
        return user;
    }
}

module.exports = UserRepository;
