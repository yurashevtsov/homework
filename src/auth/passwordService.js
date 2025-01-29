"use strict";

const bcrypt = require("bcrypt");

async function hashPassword(password, saltRounds = 12) {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function isValidPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  isValidPassword,
};
