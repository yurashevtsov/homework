"use strict";

const routerInstance = require("express").Router();
const postController = require("@src/resources/post/postController");
const authMiddleware = require("@src/auth/authorization.middleware.js");

routerInstance.use(authMiddleware.tokenAuthHandler); // middleware to validate token before accessing routes AND attach a user to the request

routerInstance.get("/", postController.getAllPosts);
routerInstance.get("/:id", postController.getOnePost);
routerInstance.post("/", postController.createPost);
routerInstance.put("/:id", postController.updatePost);
routerInstance.delete("/:id", postController.deletePost);

module.exports = routerInstance;
