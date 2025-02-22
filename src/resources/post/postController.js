"use strict";

const catchAsync = require("@src/utils/catchAsync.js");
const postService = require("@src/resources/post/postService");

async function getAllPosts(req, res) {
  res
    .status(200)
    // .send(await postService.getAllPostsWithTags(req.user.id, req.query));
    .send(await postService.getAllPostsWithTags(req.user.id, req.query));
}

async function getOnePost(req, res) {
  res
    .status(200)
    .send(await postService.getOnePostWithAllTags(req.params.id, req.user.id));
}

// creates a new post WITH tags
async function createPost(req, res) {
  res
    .status(201)
    // .send(await postService.createPostWithTags(req.user.id, req.body));
    .send(await postService.createPostWithTags(req.user.id, req.body));
}

// updates a post
// can update tags by names - passing a string of tags
async function updatePost(req, res) {
  res
    .status(200)
    .send(
      await postService.updatePostWithTags(req.params.id, req.user.id, req.body)
    );
}

async function deletePost(req, res) {
  res
    .status(204)
    .send(await postService.deletePostById(req.params.id, req.user.id));
}

module.exports = {
  getAllPosts: catchAsync(getAllPosts),
  getOnePost: catchAsync(getOnePost),
  createPost: catchAsync(createPost),
  updatePost: catchAsync(updatePost),
  deletePost: catchAsync(deletePost),
};
