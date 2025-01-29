"use strict";
const HttpBaseError = require("./httpsBaseError.js");

// 401
const { HTTP_STATUS_UNAUTHORIZED } = require("http2").constants;

module.exports = class HttpUnauthorizedError extends HttpBaseError {
  statusCode = HTTP_STATUS_UNAUTHORIZED;
};
