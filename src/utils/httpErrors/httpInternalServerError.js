"use strict";

const HttpBaseError = require("./httpsBaseError.js");

// 500
const { HTTP_STATUS_INTERNAL_SERVER_ERROR } = require("http2").constants;

module.exports = class HttpInternalServerError extends HttpBaseError {
  statusCode = HTTP_STATUS_INTERNAL_SERVER_ERROR;
};
