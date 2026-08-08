const { Op, Sequelize } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const CrudRepository = require("./crud-repository");
const { Flight, Airplane, Airport, City, Seat } = require("../models");
const AppError = require("../utils/errors/app-error");
const db = require("../models");

class FlightRepository extends CrudRepository {
  constructor() {
    super(Flight);
  }

  async get(id) {
    try {
      const response = await Flight.findByPk(id, {
        include: [
          {
            model: Airplane,
            required: true,
            as: "airplaneDetail",
            include: [
              {
                model: Seat,
                required: false
              }
            ]
          },
          {
            model: Airport,
            required: true,
            as: "departureAirport",
            include: {
              model: City,
              required: true,
            },
          },
          {
            model: Airport,
            required: true,
            as: "arrivalAirport",
            include: {
              model: City,
              required: true,
            },
          },
        ],
      });
      if (!response) {
        throw new AppError(
          "Not able to find the resource",
          StatusCodes.NOT_FOUND
        );
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getAllFlights(filter, sort) {
    const response = await Flight.findAll({
      where: filter,
      order: sort,
      include: [
        {
          model: Airplane,
          required: true,
          as: "airplaneDetail",
        },
        {
          model: Airport,
          required: true,
          as: "departureAirport",
          include: {
            model: City,
            required: true,
          },
        },
        {
          model: Airport,
          required: true,
          as: "arrivalAirport",
          include: {
            model: City,
            required: true,
          },
        },
      ],
    });
    return response;
  }

  async updateRemainingSeats(flightId, seats, dec = 1) {
    const transaction = await db.sequelize.transaction();
    try {
      const flight = await Flight.findByPk(flightId, { transaction: transaction });
      if (parseInt(dec)) {
        await flight.decrement(
          "totalSeats",
          { by: seats, transaction: transaction }
        );
      } else {
        console.log("inside increment");
        await flight.increment(
          "totalSeats",
          { by: seats, transaction: transaction }
        );
      }
      await transaction.commit();
      return flight;
    } catch (error) {
        console.error("FlightRepository Error Details:", error);
        await transaction.rollback();
        throw error;
    }
  }
}

module.exports = FlightRepository;
