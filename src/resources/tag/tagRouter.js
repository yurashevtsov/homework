"use strict";

const routerInstance = require("express").Router();
const tagController = require("@src/resources/tag/tagController.js");
const authMiddleware = require("@src/auth/authorization.middleware.js");

routerInstance.use(authMiddleware.tokenAuthHandler);

routerInstance.get("/", tagController.getAllTags);
routerInstance.get("/:id", tagController.getOneTag);
routerInstance.post("/", tagController.createTag);
routerInstance.put("/:id", tagController.updateTag);
routerInstance.delete("/:id", tagController.deleteTag);

module.exports = routerInstance;
