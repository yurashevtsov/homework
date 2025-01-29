"use strict";

const catchAsync = require("@src/utils/catchAsync.js");
const { User, Post, Comment } = require("@src/associations/index.js");
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
  // specific user - req.user.id

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
  const allComments = await Comment.findAll({
    where: { userId: req.user.id },
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
  // too easy?
  // const comment = await Comment.create({
  //   content: req.body.content,
  //   postId: req.body.postId,
  //   userId: req.user.id,
  // });
  const postToAssociateWith = await Post.findOne({
    where: { id: req.body.postId },
  });

  if (!postToAssociateWith) {
    return next(
      new HttpNotFoundError(
        "Post with that id not found or not associated with this user"
      )
    );
  }

  const newComment = await Comment.create({
    content: req.body.content,
  });

  await postToAssociateWith.addComment(newComment); // associate new comment with post
  await newComment.setUser(req.user); // associate comment with current user

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

module.exports = {
  getAllComments: catchAsync(getAllComments),
  getOneCommentById: catchAsync(getOneCommentById),
  createComment: catchAsync(createComment),
  updateComment: catchAsync(updateComment),
  deleteComment: catchAsync(deleteComment),
};
