"use strict";

const path = require("path");

const configEnv =
  process.env.NODE_ENV === "production"
    ? ".env.production.local"
    : process.env.NODE_ENV === "development"
    ? ".env.development.local"
    : ".env.test.local";

require("dotenv").config({ path: path.join(__dirname, "..", "..", configEnv) });

module.exports = Object.freeze({
  /** @type {string} */
  nodeEnv: process.env.NODE_ENV || "development",
  /** @type {number} */
  serverPort: Number.parseInt(process.env.SERVER_PORT) || 3000,
  /** @type {string} */
  dbName: process.env.DATABASE_NAME || "post_notes_repractice",
  /** @type {string} */
  dbUser: process.env.DATABASE_USER || "root",
  /** @type {string} */
  dbPassword: process.env.DATABASE_PASSWORD || "",
  /** @type {number} */
  dbPort: Number.parseInt(process.env.DATABASE_PORT) || 3306,
  /** @type {string} */
  dbHost: process.env.DATABASE_HOST || "localhost",
  /** @type {string} */
  dbDialect: process.env.DATABASE_DIALECT || "mysql",
  /** @type {string} */
  jwtSecret: process.env.JWT_SECRET || "secret",
  /** @type {string} */
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
});
