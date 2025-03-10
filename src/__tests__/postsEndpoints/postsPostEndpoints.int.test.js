const request = require("supertest");
const db = require("@src/database/models/sequelize_db");
const app = require("@src/app");

const POSTS_ENDPOINT = "/api/homework/posts/";
const SIGNUP_ENDPOINT = "/api/homework/users/signup";
const {
  initDB,
  closeDB,
  clearPostTable,
  clearTagTable,
  createPostsWithTags,
  clearUserTable,
} = require("../testHelpers");

describe("describe", () => {
  beforeAll(async () => {
    await initDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  describe("description", () => {
    test("should test", async () => {});
  });
});
