const db = require("@src/database/models/sequelize_db");
/**
 * @type {import('sequelize').Sequelize}
 */
const sequelizeInstance = db.sequelize;
const { Post, Tag } = sequelizeInstance.models;

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

async function createPostsWithTags(data) {
  if (!Array.isArray(data)) {
    throw new Error("Must be an array");
  }

  try {
    // contains array with strings - ["gw1, gw2", "gw3, gw4"]
    const tags = data.map((p) => p.tags);
    // split it like that and remove whitespace [["tag1", "tag2"], ["tag3", "tag4"]];
    const filteredTags = tags.map((tagSection) =>
      tagSection
        .split(",")
        .map((oneTag) => oneTag.trim())
        .join(",")
    );
    // each post will have its own tags with the same index
    const splitForOrder = filteredTags.map((tag) => tag.split(","));
    // each tag will become an object with name property
    const tagsObjects = splitForOrder.map((tag) => {
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
  clearPostTable,
  clearTagTable,
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
