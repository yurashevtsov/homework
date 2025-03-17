"use strict";

const jwtService = require("@src/auth/jwtService.js");
const userService = require("@src/resources/user/userService.js");
const catchAsync = require("@src/utils/catchAsync.js");

const {
  HttpBadRequestError,
  HttpUnauthorizedError,
} = require("@src/utils/httpErrors");

async function tokenAuthHandler(req, res, next) {
  // so, assuming : req.headers.authorization && req.headers.authorization.startsWith("Bearer")
  //   const token = req.headers.authorization.split(" ")[1];

  // 1. get user token
  let token = undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new HttpBadRequestError("Invalid token or it doesnt exists"));
  }

  // 2.decode token
  const payload = await jwtService.decodeToken(token);

  // 3. Make sure scope contains - AUTHENTICATION
  if (!payload?.scope.includes("AUTHENTICATION")) {
    return next(new HttpBadRequestError("Invalid token"));
  }

  // 4. Make sure user still exists
  const foundUser = await userService.getUserByIdNoError(payload.id);

  if (!foundUser) {
    return next(new HttpBadRequestError("User doesnt exists Invalid token"));
  }
  
  // 5. make sure user didnt change his password after token was issued
  const recentlyChangedPassword = jwtService.userChangedPasswordAfter(
    foundUser.changedPasswordAt,
    payload.iat
  );

  if (recentlyChangedPassword) {
    return next(
      new HttpUnauthorizedError(
        "User recently changed his password. Please login again"
      )
    );
  }

  // 6. attach user to a request object
  req.user = foundUser;

  next();
}

module.exports = {
  tokenAuthHandler: catchAsync(tokenAuthHandler),
};
