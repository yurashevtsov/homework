// const fs = require("fs");
const appConfig = require("../../config/index.js");

module.exports = {
  development: {
    username: appConfig.dbUser,
    password: appConfig.dbPassword,
    database: appConfig.dbName,
    host: appConfig.dbHost,
    port: appConfig.dbPort,
    dialect: appConfig.dbDialect,
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  test: {
    username: appConfig.dbUser,
    password: appConfig.dbPassword,
    database: appConfig.dbName,
    host: appConfig.dbHost,
    port: appConfig.dbPort,
    dialect: appConfig.dbDialect,
    dialectOptions: {
      bigNumberStrings: true,
    },
  },
  // production: {
  //   username: process.env.PROD_DB_USERNAME,
  //   password: process.env.PROD_DB_PASSWORD,
  //   database: process.env.PROD_DB_NAME,
  //   host: process.env.PROD_DB_HOSTNAME,
  //   port: process.env.PROD_DB_PORT,
  //   dialect: "mysql",
  //   dialectOptions: {
  //     bigNumberStrings: true,
  //     ssl: {
  //       ca: fs.readFileSync(__dirname + "/mysql-ca-main.crt"),
  //     },
  //   },
  // },
};
