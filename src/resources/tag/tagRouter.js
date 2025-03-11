"use strict";

const routerInstance = require("express").Router();
const tagController = require("@src/resources/tag/tagController.js");
const joiMiddleware = require("@src/middleware/joiMiddleware");
const authMiddleware = require("@src/auth/authorization.middleware.js");
const tagValidationSchema = require("./tagValidationSchema");

routerInstance.use(authMiddleware.tokenAuthHandler);

routerInstance.get("/", tagController.getAllTags);

routerInstance.get(
  "/:id",
  joiMiddleware.validateSchema(tagValidationSchema.validateIdSchema, "params"),
  tagController.getOneTag
);

routerInstance.post(
  "/",
  joiMiddleware.validateSchema(tagValidationSchema.tagCreateSchema),
  tagController.createTag
);

routerInstance.put(
  "/:id",
  joiMiddleware.validateSchema(tagValidationSchema.validateIdSchema, "params"),
  tagController.updateTag
);
routerInstance.delete(
  "/:id",
  joiMiddleware.validateSchema(tagValidationSchema.validateIdSchema, "params"),
  tagController.deleteTag
);

module.exports = routerInstance;
