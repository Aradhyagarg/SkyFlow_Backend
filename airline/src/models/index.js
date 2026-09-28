'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const configJson = require('../config/config.json');
const config = configJson[env] || configJson['development'] || {};
const db = {};

const mysql2 = require('mysql2');

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    dialectModule: mysql2
  });
} else {
  // Override config with environment variables if present
  const dbConfig = {
    ...config,
    dialectModule: mysql2,
    username: process.env.DB_USERNAME || config.username,
    password: process.env.DB_PASSWORD || config.password,
    database: process.env.DB_DATABASE || config.database,
    host: process.env.DB_HOST || config.host,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : config.port,
    dialectOptions: process.env.DB_SSL === 'true' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : config.dialectOptions
  };
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

const Airplane = require('./airplane')(sequelize, Sequelize.DataTypes);
const Airport = require('./airport')(sequelize, Sequelize.DataTypes);
const City = require('./city')(sequelize, Sequelize.DataTypes);
const Flight = require('./flight')(sequelize, Sequelize.DataTypes);

db[Airplane.name] = Airplane;
db[Airport.name] = Airport;
db[City.name] = City;
db[Flight.name] = Flight;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
