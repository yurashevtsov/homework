const request = require("supertest");
const app = require("@src/app");

const POSTS_ENDPOINT = "/api/homework/posts/";
const SIGNUP_ENDPOINT = "/api/homework/users/signup";

const POST_TO_CREATE = {
  title: "some title",
  content: "some content",
  tags: "politics",
};

const {
  initDB,
  closeDB,
  clearPostTable,
  clearTagTable,
  clearUserTable,
  findPostWithTags,
} = require("../endpointsTestHelpers");
const req = require("express/lib/request");

describe(`DELETE ${POSTS_ENDPOINT}`, () => {
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
    await clearPostTable();
    await clearTagTable();
    await clearUserTable();
    await closeDB();
  });

  test("should delete a post by id", async () => {
    // 1.create post
    const createRes = await request(app)
      .post(POSTS_ENDPOINT)
      .set("Authorization", `Bearer ${authToken}`)
      .send(POST_TO_CREATE);

    expect(createRes.status).toBe(201);
    // 2.delete post
    const res = await request(app)
      .delete(`${POSTS_ENDPOINT}${createRes.body.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(204);
  });

  test("Should not delete someone's else posts (404)", async () => {
    // create a post
    const createdPostRes = await request(app)
      .post(POSTS_ENDPOINT)
      .set("Authorization", `Bearer ${authToken}`)
      .send(POST_TO_CREATE);

    expect(createdPostRes.status).toBe(201);
    // login(signup) as someone else and try to delete original post
    const signupRes = await request(app).post(SIGNUP_ENDPOINT).send({
      username: "anotherUser",
      email: "anotheruser@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });

    const secondUser = signupRes.body.user;
    const secondUserToken = signupRes.body.token;
    // trying to delete original post with second user
    const deleteRes = await request(app)
      .delete(`${POSTS_ENDPOINT}${createdPostRes.body.id}`)
      .set("Authorization", `Bearer ${secondUserToken}`);

    // console.log(deleteRes.text);
    expect(deleteRes.status).toBe(404);
    expect(deleteRes.text).toContain("not found"); // "Post with that id 283 is not found"
  });

  test("Should return 404 if post doesnt exists", async () => {
    const res = await request(app)
      .delete(`${POSTS_ENDPOINT}999999999999`)
      .set("Authorization", `Bearer ${authToken}`);

    // console.log(res.text);
    expect(res.status).toBe(404);
    expect(res.text).toContain("not found"); // Post with that id 9999999999999999999 is not found
  });

  test("should throw an error on invalid id", async () => {
    const invalidId = "asd";
    const res = await request(app)
      .delete(`${POSTS_ENDPOINT}${invalidId}`)
      .set("Authorization", `Bearer ${authToken}`);

    // console.log(res.text);
    expect(res.status).toBe(400);
    expect(res.text).toContain(`"id" must be a number`); // Post with that id 9999999999999999999 is not found
  });
});
