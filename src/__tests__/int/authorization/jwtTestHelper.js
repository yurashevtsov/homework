const config = require("@src/config/index.js");
const jwt = require("jsonwebtoken");
const packageJson = require("../../../../package.json");

function encodeToken(id, scope) {
  return jwt.sign({ sub: id, scope }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    issuer: packageJson.name,
    audience: packageJson.name,
  });
}

function createExpiredToken(id, scope) {
  return jwt.sign(
    { sub: id, scope, iat: Math.floor(Date.now() / 1000) },
    config.jwtSecret,
    { expiresIn: 0, issuer: packageJson.name, audience: packageJson.name }
  );
}

function createBackdateToken(id, scope) {
  return jwt.sign(
    { sub: id, scope, iat: Math.floor(Date.now() / 1000) - 30 },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
      issuer: packageJson.name,
      audience: packageJson.name,
    }
  );
}

module.exports = {
  encodeToken,
  createExpiredToken,
  createBackdateToken,
};
