"use strict";
const {
  HttpBaseError,
  HttpInternalServerError,
  HttpBadRequestError,
  HttpUnauthorizedError,
  // HttpForbiddenError,
  // HttpNotFoundError,
} = require("./httpErrors");

const { UniqueConstraintError } = require("sequelize");

const { TokenExpiredError, JsonWebTokenError } = require("jsonwebtoken");
const { ValidationError } = require("joi");

module.exports = class HttpErrorFactory {
  static buildHttpError(fromError) {
    let result;
    if (fromError instanceof HttpBaseError) {
      result = fromError;
    } else {
      switch (fromError.constructor) {
        case ValidationError:
          result = new HttpBadRequestError(fromError.message);
          break;

        case TokenExpiredError:
          result = new HttpUnauthorizedError(fromError.message);
          break;

        case JsonWebTokenError:
          result = new HttpBadRequestError(fromError.message);
          break;

        // sequelize unique error (if its already exists in the database)
        case UniqueConstraintError:
          result = new HttpBadRequestError(
            fromError.errors.map((obj) => obj.message).join(",")
          );
          // result = new HttpBadRequestError(fromError.message);
          break;

        default:
          result = new HttpInternalServerError(fromError.message);
      }
    }

    return result;
  }
};
