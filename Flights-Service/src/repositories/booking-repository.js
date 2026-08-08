const { StatusCodes } = require("http-status-codes");
const { Logger } = require("../config");
const AppError = require("../utils/errors/app-error");
const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");
const { Op } = require("sequelize");
const { BOOKED, CANCELLED } = require("../utils/common/enums").BOOKING_STATUS;

class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }
  async createBooking(data, transaction) {
    const response = await Booking.create(data, { transaction: transaction });
    return response;
  }
  async get(data, transaction) {
    try {
      const { Passenger } = require("../models");
      const response = await Booking.findByPk(data, {
        transaction: transaction,
        include: [
          {
            model: Passenger,
            as: "passengers"
          }
        ]
      });
      if (!response) {
        throw new AppError(
          "Not able to fund the resource",
          StatusCodes.NOT_FOUND
        );
      }
      return response;
    } catch (error) {
      Logger.error("Something went wrong in the Crud Repo : get");
      throw error;
    }
  }
  async update(id, data, transaction) {
    try {
      const response = await Booking.update(data, {
        where: {
          id: id,
        },
        transaction: transaction,
      });
      return response;
    } catch (error) {
      Logger.error("Something went wrong in the Crud Repo : update");
      throw error;
    }
  }
  async cancelOldBooking(timestamp) {
    const response = await Booking.findAll({
      where: {
        createdAt: { [Op.lt]: timestamp },
        status: { [Op.notIn]: [BOOKED, CANCELLED] }
      },
    });
    return response;
  }
}

module.exports = BookingRepository;
