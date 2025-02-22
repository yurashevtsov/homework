"use strict";

// module for easy aliases
require("module-alias/register");

// config must be required first for everything below to access it
const config = require("@src/config");
const app = require("@src/app.js");

const db = require("@src/database/models/sequelize_db");

// when database connected, only then listen for requests
async function startApp() {
  console.log(`Work environment: ${process.env.NODE_ENV}`);

  await db.sequelize.authenticate();
  console.log("Connection to the database has been established successfully.");

  app.listen(config.serverPort, () => {
    console.log(`Server is running on port ${config.serverPort}`);
  });
}

startApp();
