const db = require("@src/database/models/sequelize_db");
/**
 * @type {import('sequelize').Sequelize}
 */
const sequelizeInstance = db.sequelize;
const { User, Post, Tag } = sequelizeInstance.models;
const { Op } = require("sequelize");

async function initDB() {
  await db.sequelize.authenticate();
}

async function closeDB() {
  await db.sequelize.close();
}

async function clearUserTable() {
  await User.destroy({
    where: {},
  });
}

/**
 * Deletes users from the database whose IDs are not in the provided values.
 *
 * @param {...number} values - The IDs of users to retain in the database.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
async function partialUserTableClear(...values) {
  await User.destroy({
    where: {
      id: {
        [Op.notIn]: values,
      },
    },
  });
}

/**
 * Creates a new user in the database.
 *
 * @param {Object} userData - The user data to create a new user.
 * @param {string} userData.username - The username of the user.
 * @param {string} userData.email - The email address of the user.
 * @param {string} userData.password - The password for the user.
 * @param {string} userData.repeatPassword - The password confirmation for the user.
 * @returns {Promise<Object>} A promise that resolves to the created User object.
 */
async function createUser(userData) {
  return await User.create(userData);
}

// to avoid logging in after password change etc, less painful than supertest
async function findUserById(id) {
  return await User.findOne({
    where: {
      id,
    },
  });
}

/**
 * Creates multiple tags in the database from a comma-separated string.
 *
 * @param {string} tags - A comma-separated string of tag names.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of created Tag instances.
 */
async function createTags(tags) {
  // removes whitespaces and returns an array of objects with name property [ {name:"gw1"}, { name: "gw2" }, {name: "gw3" } ]
  const tagsArr = tags.split(",").map((tag) => {
    return {
      name: tag.trim(),
    };
  });
  return await Tag.bulkCreate(tagsArr);
}

async function findPostWithTags(id, userId) {
  return await Post.findOne({
    where: {
      id,
      userId,
    },
    include: {
      model: Tag,
      as: "tags",
      through: {
        attributes: [],
      },
    },
  });
}

async function clearPostTable() {
  await Post.destroy({
    where: {},
  });
}

async function clearTagTable() {
  await Tag.destroy({
    where: {},
  });
}

// converts string to array and remove whitespaces
function convertStrToArray(inputStr) {
  return inputStr.split(",").map((item) => item.trim());
}

/**
 * Creates posts based on the provided data.
 *
 * @param {Array<Object>} data - An array of objects representing posts to create.
 * @returns {Promise<Array>} A promise that resolves to an array of created posts.
 */
async function createPostsWithTags(data) {
  if (!Array.isArray(data)) {
    throw new Error("Must be an array");
  }

  try {
    // contains array of tags with strings - ["gw1, gw2", "gw3, gw4"]
    const tags = data.map((p) => p.tags);

    // remove tags from posts
    const posts = data.map((post) => {
      Reflect.deleteProperty(post, "tags");

      return post;
    });

    // each post will have its own tags with the same index as post - [["gw1", "gw5"], ["gw2", "gw6"]]
    const filteredTags = tags.map((tagSection) => {
      const tags = convertStrToArray(tagSection);
      return [...new Set(tags)]; // removing dublicates if they exists
    });

    // each tag will become an object with name property [[{name: "gw1"}, {name:"gw5"}], [{name:"gw2"},{name:"gw6"}]]
    const tagsToCreate = filteredTags.map((tag) => {
      return tag.map((t) => {
        return {
          name: t,
        };
      });
    });

    const createdPosts = await Post.bulkCreate(posts);
    // same as splitForOrder but with created tags and associated posts-indexes
    const createdTags = await Promise.all(
      tagsToCreate.map(async (tag) => {
        return await Tag.bulkCreate(tag);
      })
    );

    // for associations - tag id's that belong to their each post
    const createdTagsIds = createdTags.map((tagsArr) => {
      return tagsArr.map((t) => t.id);
    });

    // creating association and assign to a post its tags
    await Promise.all(
      createdPosts.map(async (post, postIndex) => {
        await post.setTags(createdTagsIds[postIndex]);
        post.tags = createdTags[postIndex];
        return post;
      })
    );

    // each post will have its own created tags
    return createdPosts;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  initDB,
  closeDB,
  clearUserTable,
  clearPostTable,
  clearTagTable,
  partialUserTableClear,
  findUserById,
  createUser,
  createPostsWithTags,
  findPostWithTags,
  createTags,
};
