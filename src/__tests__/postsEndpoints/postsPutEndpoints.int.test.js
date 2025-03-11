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
} = require("../endpointsTestHelpers");

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

  afterEach(async () => {
    // clearing table/tags tables after each test
    await Promise.all([clearPostTable(), clearTagTable()]);
  });

  test("should update post data", async () => {
    const updatePostData = {
      title: "updated title",
      content: "updated content",
    };
    // create post that we can update
    const createdPost = await createPostsWithTags([
      { userId: auhtorizedUser.id, ...POST_TO_CREATE },
    ]);
    // make sure that post was created
    const requiredFields = ["id", "userId", "title", "content", "tags"];

    requiredFields.forEach((field) => {
      expect(createdPost[0]).toHaveProperty(field);
    });

    // request to update created post
    const updateRes = await request(app)
      .put(`${POSTS_ENDPOINT}${createdPost[0].id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: updatePostData.title,
        content: updatePostData.content,
      });

    // console.log(updateRes.text);
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe(updatePostData.title);
    expect(updateRes.body.content).toBe(updatePostData.content);
  });

  test("should update tags data", async () => {
    const tagsToUpdate = "yolo, fun";
    // create post that we can update
    const createdPost = await createPostsWithTags([
      { userId: auhtorizedUser.id, ...POST_TO_CREATE },
    ]);
    // make sure that post was created
    const requiredFields = ["id", "userId", "title", "content", "tags"];

    requiredFields.forEach((field) => {
      expect(createdPost[0]).toHaveProperty(field);
    });

    // request to update created post
    const updateRes = await request(app)
      .put(`${POSTS_ENDPOINT}${createdPost[0].id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        tags: tagsToUpdate,
      });

    // `updatedRes.tags` wil look like this  [ { id: 119, name: 'yolo' }, { id: 120, name: 'fun' } ]
    // making it ["yolo", "fun"];
    const updatedTagNames = updateRes.body.tags.map((tag) => tag.name);
    // returns true if all updated tag names are included in request
    const correctlyUpdatedTags = updatedTagNames.every((tagName) =>
      tagsToUpdate.includes(tagName)
    );

    expect(updateRes.status).toBe(200);
    expect(correctlyUpdatedTags).toBe(true);
  });

  test("should not update post that doesnt belong to him (404)", async () => {
    let secondUser;
    let secondUserAuthToken;
    // create a post with tags by created user (before tests)
    const firstUserPost = await createPostsWithTags([
      { userId: auhtorizedUser.id, ...POST_TO_CREATE },
    ]);

    expect(firstUserPost[0].id).toBeDefined();

    // create a new user
    const signupRes = await request(app).post(SIGNUP_ENDPOINT).send({
      username: "seconduser",
      email: "seconduser@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });

    secondUser = signupRes.body.user;
    secondUserAuthToken = signupRes.body.token;
    // token should be present
    expect(signupRes.body.token).toBeDefined();
    // use new token to edit post created by first user
    const updateRes = await request(app)
      .put(`${POSTS_ENDPOINT}${firstUserPost[0].id}`)
      .set("Authorization", `Bearer ${secondUserAuthToken}`)
      .send({
        title: "Yoooooooo",
      });

    // console.log(updateRes.text);
    // get 404 error
    expect(updateRes.status).toBe(404);
    expect(updateRes.text).toContain(`not found`);
  });
});
