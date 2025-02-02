"use strict";

const express = require("express");
const app = express();
const { HttpNotFoundError } = require("@src/utils/httpErrors");
const globalErrorHandler = require("@src/utils/globalErrorHandler.js");

// routes
const userRouter = require("@src/resources/user/userRouter.js");
const postRouter = require("@src/resources/post/postRouter.js");
const commentRouter = require("@src/resources/comment/commentRouter.js");
const tagRouter = require("@src/resources/tag/tagRouter.js");
// routes end here

// body parser
app.use(express.json());

app.use("/api/homework/users", userRouter);
app.use("/api/homework/posts", postRouter);
app.use("/api/homework/comments", commentRouter);
app.use("/api/homework/tags", tagRouter);

app.all("*", (req, res, next) => {
  next(new HttpNotFoundError(`${req.originalUrl} is not found on this server`));
});

app.use(globalErrorHandler);

module.exports = app;
