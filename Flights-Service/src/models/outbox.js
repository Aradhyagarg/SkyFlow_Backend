'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Outbox extends Model {
    static associate(models) {
      // define association here
    }
  }
  Outbox.init({
    eventType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'processed', 'failed'),
      defaultValue: 'pending',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Outbox',
    tableName: 'Outbox'
  });
  return Outbox;
};
