"use strict";

const catchAsync = require("@src/utils/catchAsync.js");
const User = require("@src/user/userModel");
const Post = require("@src/post/postModel");
const Comment = require("@src/comment/commentModel");
const { HttpNotFoundError } = require("@src/utils/httpErrors");

/* COMMENT: id, content, postId, userId, createdAt
  example
  {
    content: "comment content",
    postId: postId,
    userId: userId,
  }
*/

// ! get all comments for logged in user
async function getAllComments(req, res, next) {
  // easy way
  // const allComments = await Comment.findAll({
  //   where: { userId: req.user.id },
  // });

  // const foundUser = await User.findOne({
  //   where: { id: req.user.id },
  //   include: [
  //     {
  //       // model: Post,
  //       // as: "posts",
  //       association: "posts", // it works! instead of passing alias AND model
  //     },
  //   ],
  // });

  // const posts = await req.user.getPosts(); // IT WORKS!!!!!!!
  // const allComments = await Comment.findAll({
  //   where: { userId: req.user.id },
  // });

  // ! with users, why not?
  const allComments = await Comment.findAll({
    include: {
      association: "user",
    },
  });

  res.status(200).send({
    message: `Comments made by user ${req.user.username}`,
    data: allComments,
  });
}

// ! get one comment
async function getOneCommentById(req, res, next) {
  const foundComment = await Comment.findOne({
    where: { id: req.params.id },
  });

  if (!foundComment) {
    return next(new HttpNotFoundError("Comment with that id not found"));
  }

  res.status(200).send(foundComment);
}

// ! what to do with postId?  I'm passing it in the body, it should have some post attached I guess?
// ! create comment
async function createComment(req, res, next) {
  const newComment = await Comment.create({
    content: req.body.content,
    postId: req.body.postId,
    userId: req.user.id,
  });

  res.status(201).send(newComment);
}

// !update comment
async function updateComment(req, res, next) {
  const foundComment = await Comment.findOne({
    where: {
      userId: req.params.id,
    },
  });

  if (!foundComment) {
    return next(new HttpNotFoundError("Comment with that id wasnt found"));
  }

  foundComment.set({
    content: req.body,
  });

  await foundComment.save();

  res.status(200).send(foundComment);
}

async function deleteComment(req, res, next) {
  const foundComment = await Comment.findOne({
    where: { id: req.params.id },
  });

  if (!foundComment) {
    return next(new HttpNotFoundError("Comment with that id not found"));
  }

  // remove comment from database
  await foundComment.destroy();

  res.status(204).send();
}

// ! GET ALL COMMENTS - FOR LOGGED IN USER
async function getAllMyComments(req, res, next) {
  const myComments = await Comment.findAll({
    where: {
      userId: req.user.id,
    },
  });

  res.status(200).send(myComments);
}

// ! GET COMMENT - for logged in user
async function getOneMyComment(req, res, next) {
  const commentId = req.params.id;
  const userId = req.user.id;

  // ! just using mixin(special function)
  // const myComment = await req.user.getComments({
  //   where: {
  //     id: commentId,
  //   },
  // });

  // !comment and its user, just for fun
  // const myComment = await Comment.findOne({
  //   where: {
  //     id: commentId,
  //   },
  //   include: [
  //     {
  //       association: "user",
  //     },
  //   ],
  // });

  const myComment = await Comment.findOne({
    where: {
      id: commentId,
      userId: userId,
    },
  });

  res.status(200).send(myComment);
}

// ! UPDATE COMMENT - for logged in user
async function updateMyComment(req, res, next) {
  const userId = req.user.id;

  const foundComment = await Comment.findOne({
    where: {
      id: req.params.id,
      userId,
    },
  });

  if (!foundComment) {
    return next(new HttpNotFoundError("Comment with that id is not found"));
  }

  // i dont think comment should be reassigned to which post it belongs
  foundComment.set({
    content: req.body.content,
  });

  foundComment.save();

  res.status(200).send(foundComment);
}

//! DELETE COMMENT - for logged in user
async function deleteMyComment(req, res, next) {
  const myFoundComment = await Comment.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
    },
  });

  if (!myFoundComment) {
    return next(new HttpNotFoundError("Comment with that id is not found"));
  }

  await myFoundComment.destroy();

  res.status(204).send();
}

module.exports = {
  getAllComments: catchAsync(getAllComments),
  getOneCommentById: catchAsync(getOneCommentById),
  createComment: catchAsync(createComment),
  updateComment: catchAsync(updateComment),
  deleteComment: catchAsync(deleteComment),
};
