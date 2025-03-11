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
 * Accepts any amount of arguments, should be (id) numbers, that would be kept in database and the rest are deleted.
 * @param  {number} values id numbers
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
 * @param {Object[]} data expects an array [{userId: 1, content: "somecontent", title: "title"}]
 * @returns {Array} Array with created posts
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
};

// const request = require("supertest");
// const db = require("@src/database/models/sequelize_db");
// const app = require("@src/app");

// // const testHelpers = require("./testHelpers");

// describe(`PUT ${POSTS_ENDPOINT}`, () => {
//   let auhtorizedUser;
//   let authToken;

//   beforeAll(async () => {
//     await initDB();

//     const signupRes = await request(app).post(SIGNUP_ENDPOINT).send({
//       username: "postUser",
//       email: "postuser@mail.com",
//       password: "pass1234",
//       repeatPassword: "pass1234",
//     });

//     auhtorizedUser = signupRes.body.user;
//     authToken = signupRes.body.token;
//   });

//   afterAll(async () => {
//     await Promise.all([clearUserTable(), clearPostTable(), clearTagTable()]);
//     await closeDB();
//   });

//   test("should test", async () => {});
// });
