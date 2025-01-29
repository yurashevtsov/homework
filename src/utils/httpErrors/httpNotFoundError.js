"use strict";

const HttpBaseError = require("./httpsBaseError.js");

// 404
const { HTTP_STATUS_NOT_FOUND } = require("http2").constants;

module.exports = class HttpNotFoundError extends HttpBaseError {
  statusCode = HTTP_STATUS_NOT_FOUND;
};
