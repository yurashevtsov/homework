// const { Post, Tag } = require("@src/associations/models/index");
// I need both - post and tag models
/**
 * @type {import('sequelize').Sequelize}
 */
const sequelizeInstance =
  require("@src/database/models/sequelize_db").sequelize;
const { Post, User } = sequelizeInstance.models;

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
//!commented out temporarily for testing migrations
// async function getAllPostsWithTags(userId, queryParams) {
//   const initQuery = {
//     where: {
//       userId,
//     },
//     include: {
//       model: Tag,
//       as: "tags",
//       through: {
//         attributes: [],
//       },
//     },
//   };

//   const { databaseQuery } = new appFeatures(initQuery, queryParams);

//   return await Post.findAll(databaseQuery);
// }

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

async function createPostNoTags(userId, postData) {
  const newPost = await Post.create({
    ...postData,
    userId,
  });

  return newPost;
}

// logged in user post WITH tags
//! temporarily commented out for migration testing
// async function getOnePostWithAllTags(postId, userId) {
//   const postWithTags = await Post.findOne({
//     where: {
//       id: postId,
//       userId,
//     },
//     include: {
//       // association: "tags",
//       model: Tag,
//       as: "tags",
//       through: {
//         attributes: [],
//       },
//     },
//   });

//   if (!postWithTags) {
//     throw new HttpNotFoundError(`Post with id ${postId} is not found.`);
//   }

//   return postWithTags;
// }

/**
 * @param {number} userId currently logged in user
 * @param {string[]} tagsArr array of strings, tags that will be created/fetched from DB
 * @returns {Post}
 */
async function createPostWithTags(userId, postData) {
  const transaction = await sequelizeInstance.transaction();

  try {
    const tagsToAssociate = await tagService.findOrCreateTags(
      postData.tags,
      transaction
    );

    const newPost = await Post.create(
      { ...postData, userId: userId },
      { transaction: transaction }
    );
    //6. Associate tags with a post
    // if tags were fetched or created only then associate them with post
    if (tagsToAssociate.length > 0) {
      await newPost.setTags(tagsToAssociate, { transaction: transaction });
    }

    await transaction.commit();

    return { ...newPost.toJSON(), tags: tagsToAssociate.map((t) => t.name) };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
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

  // start transaction only if post exists
  const transaction = await sequelizeInstance.transaction();

  try {
    // updating the post
    postToUpdate.set({ postData });
    await postToUpdate.save();
    // looking for tags
    const tags = await tagService.findOrCreateTags(postData.tags, transaction);
    // creating association
    await postToUpdate.setTags(tags, { transaction });
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
    throw new HttpNotFoundError(`Post with that id ${postId} is not found.`);
  }

  await postToDelete.destroy();

  return null;
}

module.exports = {
  getAllPostsNoTags,
  //! getAllPostsWithTags,
  getOnePostByIdNoTags,
  //! getOnePostWithAllTags,
  createPostNoTags,
  createPostWithTags,
  updatePostWithTags,
  deletePostById,
};
