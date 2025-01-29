"use strict";

const HttpBaseError = require("./httpsBaseError.js");
const HttpBadRequestError = require("./httpBadRequestError.js");
const HttpUnauthorizedError = require("./httpUnauthorizedError.js");
const HttpForbiddenError = require("./httpForbiddenError.js");
const HttpInternalServerError = require("./httpInternalServerError.js");
const HttpNotFoundError = require("./httpNotFoundError.js");

module.exports = {
  HttpBaseError,
  HttpBadRequestError,
  HttpUnauthorizedError,
  HttpForbiddenError,
  HttpInternalServerError,
  HttpNotFoundError,
};
