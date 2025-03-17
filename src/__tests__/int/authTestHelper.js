const db = require("@src/database/models/sequelize_db");
/**
 * @type {import('sequelize').Sequelize}
 */
const sequelizeInstance = db.sequelize;
const { User } = sequelizeInstance.models;

const config = require("@src/config/index.js");
const jwt = require("jsonwebtoken");
const packageJson = require("../../../package.json");

/**
 * creates a user and encode a token with authentication scope(like signup endpoint)
 *
 * @param {object} userData object with user details: username, email,password, repeatPassword
 * @returns {object} object with user and token - {user, token}
 */
async function createUserWithToken(userData) {
  const user = await User.create(userData);
  user.token = encodeToken({ id: user.id }, "AUTHENTICATION");

  return user;
}

function encodeToken(sub, scope) {
  return jwt.sign({ ...sub, scope }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    issuer: packageJson.name,
    audience: packageJson.name,
  });
}

function createExpiredToken(sub, scope) {
  return jwt.sign(
    { ...sub, scope, iat: Math.floor(Date.now() / 1000) },
    config.jwtSecret,
    { expiresIn: 0, issuer: packageJson.name, audience: packageJson.name }
  );
}

// 30 seconds ago
function createBackdateToken(sub, scope) {
  return jwt.sign(
    { ...sub, scope, iat: Math.floor(Date.now() / 1000) - 30 },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
      issuer: packageJson.name,
      audience: packageJson.name,
    }
  );
}

module.exports = {
  createUserWithToken,
  encodeToken,
  createExpiredToken,
  createBackdateToken,
};
