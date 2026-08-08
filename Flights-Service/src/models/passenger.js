'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Passenger extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking',
        onDelete: 'CASCADE'
      });
    }
  }
  Passenger.init({
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false
    },
    passportNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    seatNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    seatType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hasExtraBaggage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    hasMeal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    hasInsurance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Passenger',
    tableName: 'Passengers'
  });
  return Passenger;
};
