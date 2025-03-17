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
      // userId, // probably should allow to find all posts even if user didnt create it
    },
  };

  const { databaseQuery } = new appFeatures(initQuery, queryParams);

  return await Post.findAll(databaseQuery);
}

// logged in user's posts WITH tags
async function getAllPostsWithTags(userId, queryParams) {
  const initQuery = {
    where: {
      // userId, // probably should allow to find all posts even if user didnt create it
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
      // userId, // probably should allow to find all posts even if user didnt create it
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
      // userId, // probably should allow to find all posts even if user didnt create it
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
 * Creates a new post along with associated tags in a single transaction.
 *
 * @function createPostWithTags
 * @param {number} userId - The ID of the user creating the post.
 * @param {Object} postData - The data for the post, should include tag information.
 * @param {Array<string>} tagsData - An array of tag names to associate with the post. Must contain at least one tag.
 * @returns {Object} The created post object, including associated tags.
 */
async function createPostWithTags(userId, postData, tagsData) {
  //1. create transaction to make sure its all pass or nothing
  const transaction = await sequelizeInstance.transaction();

  try {
    // 2.creating a post
    const newPost = await Post.create(
      { ...postData, userId: userId },
      { transaction: transaction }
    );

    // 3.find/create tags (must be at least 1 tag)
    const tagsToAssociate = await tagService.findOrCreateTags(
      tagsData,
      transaction
    );

    // to associate with post -> an array of `id` is required, before I could use array with instances, apparently not anymore
    const tagIds = tagsToAssociate.map((tag) => tag.id);

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

/**
 * Updates a post's content and associated tags in the database.
 *
 * @function updatePostWithTags
 * @param {number} postId - The ID of the post to be updated.
 * @param {number} userId - The ID of the user who owns the post.
 * @param {Object} postData - The data to update the post with.
 * @param {string[]} [tagsData=[]] - An optional array of tag names to associate with the post.
 * @returns {Object} The updated post object, including associated tags if any were specified and updated.
 */
async function updatePostWithTags(postId, userId, postData, tagsData = []) {
  const postToUpdate = await Post.findOne({
    where: {
      id: postId,
      userId,
    },
    // could comment out to NOT show fetched tags if no tags were updated
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
    let foundOrCreatedTags;
    // updating the post
    postToUpdate.set(postData);
    await postToUpdate.save({ transaction });

    // only if 'tags' property is exists on update request, only then update tags
    if (Array.isArray(tagsData) && tagsData.length > 0) {
      // looking for tags
      foundOrCreatedTags = await tagService.findOrCreateTags(
        tagsData,
        transaction
      );
      const tagIds = foundOrCreatedTags.map((tag) => tag.id);
      // creating association
      await postToUpdate.setTags(tagIds, { transaction });
    }
    // commiting transaction
    await transaction.commit();
    // if tags were specified, they will be updated/fetched and replace initially fetched ones
    return tagsData.length > 0
      ? { ...postToUpdate.toJSON(), tags: foundOrCreatedTags }
      : postToUpdate.toJSON();
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
