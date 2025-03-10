const request = require("supertest");
const db = require("@src/database/models/sequelize_db");
const app = require("@src/app");

const POSTS_ENDPOINT = "/api/homework/posts/";
const SIGNUP_ENDPOINT = "/api/homework/users/signup";
const {
  clearPostTable,
  clearTagTable,
  createPostsWithTags,
} = require("./testHelpers");
const { clearUserTable } = require("@src/__tests__/usersEndpoints/testHelpers");

describe("describe", () => {
  beforeAll(async () => {
    await db.sequelize.authenticate();
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe("description", () => {
    test("should test", async () => {});
  });
});
