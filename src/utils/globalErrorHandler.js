"use strict";

const config = require("@src/config");
const HttpErrorFactory = require("@src/utils/httpErrorFactory.js");

// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  const actualHttpError = HttpErrorFactory.buildHttpError(err);

  if (config.nodeEnv === "development") {
    devErrHandler(actualHttpError, err, res);
  } else if (config.nodeEnv === "test") {
    testErrHandler(actualHttpError, err, res);
  } else {
    prodErrhandler(actualHttpError, res);
  }
}

function devErrHandler(appErr, originalError, res) {
  console.log(`Error name: ${originalError.name}`);
  console.log(`Error message: ${originalError.message}`);
  console.log(`Stacktrace: ${originalError.stack}`);

  res.status(appErr.statusCode).send(appErr.message);
}

function testErrHandler(appErr, originalError, res) {
  res.status(appErr.statusCode).send(appErr.message);
}

function prodErrhandler(err, res) {
  console.log(err);
  res.status(err.statusCode).send(err.message);
}

module.exports = globalErrorHandler;
