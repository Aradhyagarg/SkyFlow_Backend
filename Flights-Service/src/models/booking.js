'use strict';
const {
  Model
} = require('sequelize');
const {Enums} = require("../utils/common")
const {BOOKED, CANCELLED, INITIATED, PENDING} = Enums.BOOKING_STATUS;
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Passenger, {
        foreignKey: 'bookingId',
        as: 'passengers',
        onDelete: 'CASCADE'
      });
    }
  }
  Booking.init({
    flightId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      values: [BOOKED, CANCELLED, INITIATED, PENDING],
      defaultValue: INITIATED,
      allowNull: false,
    },
    noOfSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    totalCost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pnr: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Booking',
    paranoid: true
  });
  return Booking;
};