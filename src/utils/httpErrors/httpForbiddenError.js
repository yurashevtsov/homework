"use strict";

const HttpBaseError = require("./httpsBaseError.js");

// 400
const { HTTP_STATUS_FORBIDDEN } = require("http2").constants;

module.exports = class HttpBadRequestError extends HttpBaseError {
  statusCode = HTTP_STATUS_FORBIDDEN;
};
