"use strict";
/**
 * @type {import('sequelize').Sequelize}
 */
const sequelizeInstance =
  require("@src/database/models/sequelize_db").sequelize;
const { Post, Tag } = sequelizeInstance.models;

const { HttpNotFoundError } = require("@src/utils/httpErrors");
const tagService = require("@src/resources/tag/tagService");
const appFeatures = require("@src/utils/appFeatures.js");

// logged in user posts without tags
async function getAllPostsNoTags(userId, queryParams) {
  const initQuery = {
    where: {
      userId,
    },
  };

  const { databaseQuery } = new appFeatures(initQuery, queryParams);

  return await Post.findAll(databaseQuery);
}

// logged in user's posts WITH tags
async function getAllPostsWithTags(userId, queryParams) {
  const initQuery = {
    where: {
      userId,
    },
    include: {
      model: Tag,
      as: "tags",
      through: {
        attributes: [],
      },
    },
  };

  const { databaseQuery } = new appFeatures(initQuery, queryParams);

  return await Post.findAll(databaseQuery);
}

// logged in user post without tags
async function getOnePostByIdNoTags(postId, userId) {
  const post = await Post.findOne({
    where: {
      id: postId,
      userId,
    },
  });

  if (!post) {
    throw new HttpNotFoundError(`Post with id ${postId} is not found`);
  }

  return post;
}

async function createPostNoTags(userId, postData) {
  const newPost = await Post.create({
    ...postData,
    userId,
  });

  return newPost;
}

// logged in user post WITH tags
async function getOnePostWithAllTags(postId, userId) {
  const postWithTags = await Post.findOne({
    where: {
      id: postId,
      userId,
    },
    include: {
      // association: "tags",
      model: Tag,
      as: "tags",
      through: {
        attributes: [],
      },
    },
  });

  if (!postWithTags) {
    throw new HttpNotFoundError(`Post with id ${postId} is not found`);
  }

  return postWithTags;
}

/**
 * @param {number} userId currently logged in user
 * @param {string[]} tagsArr array of strings, tags that will be created/fetched from DB
 * @returns {Post}
 */
async function createPostWithTags(userId, postData) {
  //1. create transaction to make sure its all pass or nothing
  const transaction = await sequelizeInstance.transaction();

  try {
    // 2.find/create tags (must be at least 1 tag)
    const tagsToAssociate = await tagService.findOrCreateTags(
      postData.tags,
      transaction
    );
    // to associate with post -> an array of `id` is required, before I could use array with instances, apparently not anymore
    const tagIds = tagsToAssociate.map((tag) => tag.id);

    // 3.creating a post
    const newPost = await Post.create(
      { ...postData, userId: userId },
      { transaction: transaction }
    );
    // 4. associating posts with tags by their id
    await newPost.setTags(tagIds, { transaction: transaction });
    // 5. upon successful creating tags, posts and association -> let all changes pass
    await transaction.commit();
    // 6. slightly formatting response
    return {
      ...newPost.toJSON(),
      tags: tagsToAssociate.map((t) => t.toJSON()),
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

async function updatePostWithTags(postId, userId, postData) {
  const postToUpdate = await Post.findOne({
    where: {
      id: postId,
      userId,
    },
    include: {
      association: "tags",
      through: {
        attributes: [],
      },
    },
  });

  if (!postToUpdate) {
    throw new HttpNotFoundError(`Post with id ${postId} is not found`);
  }

  // start transaction only if post exists
  const transaction = await sequelizeInstance.transaction();

  try {
    // updating the post
    postToUpdate.set({ postData });
    await postToUpdate.save();
    // looking for tags
    const tags = await tagService.findOrCreateTags(postData.tags, transaction);
    const tagIds = tags.map((tag) => tag.id);
    // creating association
    await postToUpdate.setTags(tagIds, { transaction });
    // commiting transaction
    await transaction.commit();

    return { ...postToUpdate.toJSON(), tags: tags.map((t) => t.toJSON()) };
  } catch (err) {
    await transaction.rollback(); // in case of an error abort the changes to DB
    throw err;
  }
}

// deletes 1 post for logged in user
async function deletePostById(postId, userId) {
  const postToDelete = await Post.findOne({
    where: {
      id: postId,
      userId,
    },
  });

  if (!postToDelete) {
    throw new HttpNotFoundError(`Post with that id ${postId} is not found`);
  }

  await postToDelete.destroy();

  return null;
}

module.exports = {
  getAllPostsNoTags,
  getAllPostsWithTags,
  getOnePostByIdNoTags,
  getOnePostWithAllTags,
  createPostNoTags,
  createPostWithTags,
  updatePostWithTags,
  deletePostById,
};
