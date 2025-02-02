"use strict";

const config = require("@src/config");
const { Sequelize } = require("sequelize");
// const {
//   applyExtraSetup,
// } = require("@src/database/extra-setup");

const sequelize = new Sequelize({
  username: config.dbUser,
  password: config.dbPassword,
  host: config.dbHost,
  database: config.dbName,
  dialect: config.dbDialect,
  port: config.dbPort,
});

// initializing connection to db
async function initDB() {
  try {
    await sequelize.sync({ alter: true });

    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
}

module.exports = {
  sequelizeInstance: sequelize,
  initDB,
};
