'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Override config with environment variables if present
  const dbConfig = {
    ...config,
    username: process.env.DB_USERNAME || config.username,
    password: process.env.DB_PASSWORD || config.password,
    database: process.env.DB_DATABASE || config.database,
    host: process.env.DB_HOST || config.host,
    port: process.env.DB_PORT || config.port,
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: true
      }
    } : config.dialectOptions
  };
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

const User = require('./user')(sequelize, Sequelize.DataTypes);
db[User.name] = User;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
