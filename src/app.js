"use strict";

const express = require("express");
const app = express();
const { HttpNotFoundError } = require("@src/utils/httpErrors");
const globalErrorHandler = require("@src/utils/globalErrorHandler.js");

// homework things
const homeworkUserRouter = require("@src/user/userRouter.js");
const homeworkPostRouter = require("@src/post/postRouter.js");
const homeworkCommentRouter = require("@src/comment/commentRouter.js");
// homework things end here

// body parser
app.use(express.json());

app.use("/api/homework/users", homeworkUserRouter);
app.use("/api/homework/posts", homeworkPostRouter);
app.use("/api/homework/comments", homeworkCommentRouter);

app.all("*", (req, res, next) => {
  next(new HttpNotFoundError(`${req.originalUrl} is not found on this server`));
});

app.use(globalErrorHandler);

module.exports = app;
