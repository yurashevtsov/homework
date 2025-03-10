const db = require("@src/database/models/sequelize_db");
const { convertStringToArray } = require("@src/utils/helpers");
/**
 * @type {import('sequelize').Sequelize}
 */
const sequelizeInstance = db.sequelize;
const { User, Post, Tag } = sequelizeInstance.models;
const { Op } = require("sequelize");

async function clearUserTable() {
  await User.destroy({
    where: {},
  });
}

async function partialUserTableClear(value) {
  await User.destroy({
    where: {
      id: {
        [Op.ne]: value,
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

async function createPostsWithTags(data) {
  if (!Array.isArray(data)) {
    throw new Error("Must be an array");
  }

  try {
    // contains array of tags with strings - ["gw1, gw2", "gw3, gw4"]
    const tags = data.map((p) => p.tags);

    // remove whitespace [ ['gw1,gw5'], ['gw2,gw6'] ];
    // each post will have its own tags with the same index - [["gw1", "gw5"], ["gw2", "gw6"]]
    const filteredTags = tags.map((tagSection) =>
      convertStrToArray(tagSection)
    );

    // each tag will become an object with name property [[{name: "gw1"}, {name:"gw5"}], [{name:"gw2"},{name:"gw6"}]]
    const tagsObjects = filteredTags.map((tag) => {
      return tag.map((t) => {
        return {
          name: t,
        };
      });
    });

    // remove tags from posts
    const posts = data.map((post) => {
      Reflect.deleteProperty(post, "tags");

      return post;
    });

    const createdPosts = await Post.bulkCreate(posts);
    // same as splitForOrder but with created tags and associated posts-indexes
    const createdTags = await Promise.all(
      tagsObjects.map(async (tagObject) => {
        return await Tag.bulkCreate(tagObject);
      })
    );

    // for associations - tag id's that belong to their each post
    const createdTagsIds = createdTags.map((tagsArr) => {
      return tagsArr.map((t) => t.id);
    });

    // creating association
    await Promise.all(
      createdPosts.map(
        async (post, postIndex) => await post.setTags(createdTagsIds[postIndex])
      )
    );

    // each post will have its own created tags
    return createdPosts.map((post, i) => {
      post.tags = createdTags[i];
      return post;
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  clearUserTable,
  clearPostTable,
  clearTagTable,
  partialUserTableClear,
  findUserById,
  createUser,
  createPostsWithTags,
};

// const request = require("supertest");
// const db = require("@src/database/models/sequelize_db");
// const app = require("@src/app");

// // const testHelpers = require("./testHelpers");

// describe("describe", () => {
//   beforeAll(async () => {
//     await db.sequelize.authenticate();
//   });

//   afterAll(async () => {
//     await db.sequelize.close();
//   });

//   describe("description", () => {
//     test("should test", async () => {});
//   });
// });
