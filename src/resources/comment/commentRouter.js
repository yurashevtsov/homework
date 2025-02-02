"use strict";

const routerInstance = require("express").Router();
const commentController = require("@src/resources/comment/commentController.js");
const authMiddleware = require("@src/auth/authorization.middleware.js");

routerInstance.use(authMiddleware.tokenAuthHandler);

routerInstance.get("/", commentController.getAllComments);
routerInstance.get("/:id", commentController.getOneCommentById);
routerInstance.post("/", commentController.createComment);
routerInstance.put("/:id", commentController.updateComment);
routerInstance.delete("/:id", commentController.deleteComment);

module.exports = routerInstance;
