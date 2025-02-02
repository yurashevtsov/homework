"use strict";

// module for easy aliases
require("module-alias/register");

// config must be required first for everything below to access it
const config = require("@src/config");
const app = require("@src/app.js");

const db = require("@src/database/db.js");
const defineAssociations = require("@src/associations/index.js");
defineAssociations();

// when database connected, only then listen for requests
db.initDB().then(() => {
  app.listen(config.serverPort, () => {
    console.log(`Server is running on port ${config.serverPort}`);
  });
});
