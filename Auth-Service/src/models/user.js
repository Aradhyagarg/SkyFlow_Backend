'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');
const { ServerConfig } = require('../config');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
    }

    comparePassword(plainPassword) {
      return bcrypt.compareSync(plainPassword, this.password);
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM,
      values: ['customer', 'admin', 'airline_agent'],
      defaultValue: 'customer',
      allowNull: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passportNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    paranoid: true
  });

  User.beforeSave((user) => {
    if (user.changed('password')) {
      const encryptedPassword = bcrypt.hashSync(user.password, ServerConfig.SALT_ROUNDS);
      user.password = encryptedPassword;
    }
  });

  return User;
};
