"use strict";

const catchAsync = require("@src/utils/catchAsync.js");
// const Post = require("@src/resources/post/postModel");
const { Post } = require("@src/associations/models/index.js");
const HttpNotFoundError = require("@src/utils/httpErrors/httpNotFoundError");
const HttpUnauthorizedError = require("@src/utils/httpErrors/httpUnauthorizedError");

/*
	{
		title: "post title",
		content: "post content",
		userId: userId,
	}
*/

async function getAllPosts(req, res) {
  const allPosts = await Post.findAll({
    where: {
      userId: req.user.id,
    },
  });

  res.status(200).send(allPosts);
}

async function getOnePost(req, res, next) {
  if (!req.user.id) {
    return next(new HttpUnauthorizedError("Unauthorized")); // 401 Unauthorized
  }

  const post = await Post.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!post) {
    return next(new HttpNotFoundError("No post found with that id"));
  }

  res.status(200).send(post);
}

async function createPost(req, res, next) {
  if (!req.user.id) {
    return next(new HttpUnauthorizedError("Unauthorized")); // 401 Unauthorized
  }

  const newPost = await Post.create({
    title: req.body.title,
    content: req.body.content,
    userId: req.user.id,
  });

  res.status(201).send(newPost);
}

async function updatePost(req, res, next) {
  if (!req.user.id) {
    return next(new HttpUnauthorizedError("Unauthorized")); // 401 Unauthorized
  }

  const foundPost = await Post.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!foundPost) {
    return next(new HttpNotFoundError("No post found with that id"));
  }

  foundPost.set({
    title: req.body.title,
    content: req.body.content,
  });

  await foundPost.save();

  res.status(200).send(foundPost);
}

async function deletePost(req, res, next) {
  if (!req.user.id) {
    return next(new HttpUnauthorizedError("Unauthorized")); // 401 Unauthorized
  }

  const deletedPost = await Post.destroy({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!deletedPost) {
    return next(new HttpNotFoundError("No post found with that id"));
  }

  res.status(204).send(); // No Content status code indicates successful deletion. No body is returned.
}

module.exports = {
  getAllPosts: catchAsync(getAllPosts),
  getOnePost: catchAsync(getOnePost),
  createPost: catchAsync(createPost),
  updatePost: catchAsync(updatePost),
  deletePost: catchAsync(deletePost),
};
