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
  port: config.dbPort
});

// import models here (a function that accepts sequelize instance and initializes the model), for of loop, throw sequelize into them to "define models"
// const modelDefiners = [
//   require("@src/comment/commentModel"),
//   require("@src/user/userModel"),
//   require("@src/post/postModel"),
//   // Add more models here...
// ];

// // passes sequelize instance to models to actually define the model
// for (let modelDefiner of modelDefiners) {
//   modelDefiner(sequelize);
// }

// // actually making associations between models
// applyExtraSetup(sequelize);

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
  User: sequelize.models.user,
  Post: sequelize.models.post,
  Comment: sequelize.models.comment,
};
