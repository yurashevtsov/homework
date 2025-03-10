const request = require("supertest");
const app = require("@src/app");

const POSTS_ENDPOINT = "/api/homework/posts/";
const SIGNUP_ENDPOINT = "/api/homework/users/signup";

const POST_TO_CREATE = {
  title: "some title",
  content: "some content",
  tags: "politics, memes, gaming",
};

const {
  initDB,
  closeDB,
  clearPostTable,
  clearTagTable,
  clearUserTable,
  createPostsWithTags,
} = require("../testHelpers");

describe(`PUT ${POSTS_ENDPOINT}`, () => {
  let auhtorizedUser;
  let authToken;

  beforeAll(async () => {
    await initDB();

    const signupRes = await request(app).post(SIGNUP_ENDPOINT).send({
      username: "postUser",
      email: "postuser@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });

    auhtorizedUser = signupRes.body.user;
    authToken = signupRes.body.token;
  });

  afterAll(async () => {
    await Promise.all([clearUserTable(), clearPostTable(), clearTagTable()]);
    await closeDB();
  });

  test("should update post data", async () => {
    // create post that we can update
    const createRes = await createPostsWithTags([
      { userId: auhtorizedUser.id, ...POST_TO_CREATE },
    ]);

  });

  test("should update tags data", async () => {});

  test("should not update post that doesnt belong to him", async () => {});
});
