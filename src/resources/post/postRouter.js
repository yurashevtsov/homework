"use strict";

const routerInstance = require("express").Router();
const postController = require("@src/resources/post/postController");
const authMiddleware = require("@src/auth/authorization.middleware.js");
const joiMiddleware = require("@src/middleware/joiMiddleware.js");
const postValidationSchema = require("@src/resources/post/postValidationSchema");
const userValidationSchema = require("@src/resources/user/userValidationSchema");

routerInstance.use(authMiddleware.tokenAuthHandler); // middleware to validate token before accessing routes AND attach a user to the request

routerInstance.param(
	"id",
	joiMiddleware.validateSchema(postValidationSchema.validateIdSchema, "params")
);

routerInstance.get(
  "/",
  joiMiddleware.validateMutateQuery(userValidationSchema.querySchema),
  postController.getAllPosts
);
routerInstance.get("/:id", postController.getOnePost);
routerInstance.post(
  "/",
  joiMiddleware.validateSchema(postValidationSchema.postCreateSchema),
  postController.createPost
);
routerInstance.put("/:id",
	joiMiddleware.validateSchema(postValidationSchema.postCreateSchema),
	postController.updatePost);
routerInstance.delete("/:id", postController.deletePost);

module.exports = routerInstance;
