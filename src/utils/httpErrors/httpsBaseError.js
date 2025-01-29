"use strict";

/** @abstract */
module.exports = class HttpBaseError extends Error {
  statusCode = 0;
  constructor(...args) {
    super(...args);
    this.name = this.constructor.name;
    if (this.constructor === HttpBaseError) {
      throw new Error("Can't directly instance abstract class HttpBaseError");
    }
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
