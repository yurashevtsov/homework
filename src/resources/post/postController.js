"use strict";

const catchAsync = require("@src/utils/catchAsync.js");
// const Post = require("@src/resources/post/postModel");
const { Post, Tag, PostTag } = require("@src/associations/models/index.js");
const {
  HttpNotFoundError,
  HttpUnauthorizedError,
  HttpBadRequestError,
} = require("@src/utils/httpErrors");

/*
	{
		title: "post title",
		content: "post content",
		userId: userId,
	}
    with addition of many to many relationships - tags, now it will have tagId as well
*/

async function getAllPosts(req, res) {
  const allPosts = await Post.findAll({
    where: {
      userId: req.user.id,
    },
    include: [
      {
        association: "tags",
      },
    ],
  });

  res.status(200).send(allPosts);
}

async function getOnePost(req, res, next) {
  if (!req.user.id) {
    return next(new HttpUnauthorizedError("Unauthorized")); // 401 Unauthorized
  }

  const post = await Post.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [
      {
        model: Tag,
        as: "tags",
      },
    ],
  });

  if (!post) {
    return next(new HttpNotFoundError("No post found with that id"));
  }

  res.status(200).send(post);
}

// creates a new post WITH tags
async function createPost(req, res) {
  // lowercase tag name
  const tagsArray = req.body.tags
    .split(",")
    .map((tag) => tag.toLowerCase().trim());

  if (!req.body.tags) {
    throw new HttpBadRequestError("No tags provided.");
  }

  let createdOrFetchedTags;
  try {
    // find or create new tags
    createdOrFetchedTags = await Promise.all(
      tagsArray.map(async (tagName) => {
        // because findOrCreate returns an array of 2 items - found or created instance AND boolean - true/false depends if it was created or found
        const tag = await Tag.findOrCreate({
          where: { name: tagName },
          defaults: { name: tagName },
        });
        return tag[0];
      })
    );
  } catch (err) {
    console.log(err.message);
    throw new HttpBadRequestError("Error during creating tags.");
  }

  const newPost = await Post.create({
    title: req.body.title,
    content: req.body.content,
    userId: req.user.id,
  });

  await newPost.setTags(createdOrFetchedTags);

  res.status(201).send(newPost);
}

// updates a post
// can update tags by names - passing a string of tags
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

  // if we want to update tags on the post
  if (req.body.tags) {
    const tagsArray = req.body.tags
      .split(",")
      .map((tag) => tag.toLowerCase().trim());

      // find or create new tags
    const foundTags = await Promise.all(
      tagsArray.map(async (tagName) => {
        const tag = await Tag.findOrCreate({
          where: { name: tagName },
          defaults: { name: tagName },
        });
        return tag[0];
      })
    );

    await foundPost.setTags(foundTags);
  }

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
