"use strict";

const routerInstance = require("express").Router();
const userController = require("@src/resources/user/userController.js");
const joiMiddleware = require("@src/middleware/joiMiddleware.js");
const authMiddleware = require("@src/auth/authorization.middleware.js");
const userValidationSchema = require("@src/resources/user/userValidationSchema.js");

// SIGNUP
routerInstance.post(
  "/signup",
  joiMiddleware.validateSchema(userValidationSchema.createUserSchema),
  userController.signup
);

// LOGIN
routerInstance.post(
  "/login",
  joiMiddleware.validateSchema(userValidationSchema.loginSchema),
  userController.login
);

// AUTHORIZATION MIDDLEWARE
routerInstance.use(authMiddleware.tokenAuthHandler);

// GET ALL USERS
routerInstance.get(
  "/",
  joiMiddleware.validateSchema(userValidationSchema.querySchema, "query"),
  userController.getAllUsers
);

// GET ONE USER
routerInstance.get(
  "/:id",
  joiMiddleware.validateSchema(userValidationSchema.validateIdSchema, "params"),
  userController.getOneUser
);

// CREATE USER (Keep it for "admin" purposes...?)
routerInstance.post(
  "/",
  joiMiddleware.validateSchema(userValidationSchema.createUserSchema),
  userController.createUser
);

// UPDATE USER
routerInstance.put(
  "/:id",
  joiMiddleware.validateSchema(userValidationSchema.updateUserSchema),
  userController.updateUser
);

// DELETE USER
routerInstance.delete(
  "/:id",
  joiMiddleware.validateSchema(userValidationSchema.validateIdSchema, "params"),
  userController.deleteUser
);

module.exports = routerInstance;
