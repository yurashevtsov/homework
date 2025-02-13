const { Post, Tag } = require("@src/associations/models/index");
const { HttpNotFoundError } = require("@src/utils/httpErrors");
// const { Sequelize } = require("sequelize");
const tagService = require("@src/resources/tag/tagService");
const appFeatures = require("@src/utils/appFeatures.js");

// logged in user posts without tags
async function getAllPostsNoTags(userId) {
  return await Post.findAll({
    where: {
      userId,
    },
  });
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
    throw new HttpNotFoundError(`Post with id ${postId} is not found.`);
  }

  return post;
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
    throw new HttpNotFoundError(`Post with id ${postId} is not found.`);
  }

  return postWithTags;
}

/**
 * @param {number} userId currently logged in user
 * @param {string[]} tagsArr array of strings, tags that will be created/fetched from DB
 * @returns {Post}
 */
async function createPostWithTags(userId, postData) {
  // TODO: I need to create Joi schema to convert tags: "politics, meme, etc" into array of these values, this function doesnt do that
  // TODO: and probably find a way to combine a couple schemas objects to not create a separate schema
  // TODO: Do this with JOI -> const recievedTags = postData.tags.split(",").map((tag) => tag.trim());
  const tagsToAssociate = await tagService.findOrCreateTags(postData.tags);

  const newPost = await Post.create({ ...postData, userId: userId });

  //6. Associate tags with a post
  // if tags were fetched or created only then associate them with post
  if (tagsToAssociate.length > 0) {
    await newPost.setTags(tagsToAssociate);
  }

  return { ...newPost.toJSON(), tags: tagsToAssociate.map((t) => t.name) };
}

// TODO: create update handler
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
    throw new HttpNotFoundError(`Post with id ${postId} is not found.`);
  }

  postToUpdate.set({ postData });
  await postToUpdate.save();

  // if tags field present, we find/create tags to later associate them
  if (postData.tags) {
    const tags = await tagService.findOrCreateTags(postData.tags);

    await postToUpdate.setTags(tags);

    return { ...postToUpdate.toJSON(), tags: tags.map((t) => t.toJSON()) };
  }

  return postToUpdate;
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
    throw new HttpNotFoundError(`Post with that id ${postId} is not found.`);
  }

  await postToDelete.destroy();

  return null;
}

module.exports = {
  getAllPostsNoTags,
  getAllPostsWithTags,
  getOnePostByIdNoTags,
  getOnePostWithAllTags,
  createPostWithTags,
  updatePostWithTags,
  deletePostById,
};
