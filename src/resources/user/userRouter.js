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

routerInstance.param(
  "id",
  joiMiddleware.validateSchema(userValidationSchema.validateIdSchema, "params")
);

// GET ALL USERS
routerInstance.get(
  "/",
  joiMiddleware.validateMutateQuery(userValidationSchema.querySchema),
  userController.getAllUsers
);

// GET ONE USER
routerInstance.get("/:id", userController.getOneUser);

// CREATE USER
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
routerInstance.delete("/:id", userController.deleteUser);

module.exports = routerInstance;
