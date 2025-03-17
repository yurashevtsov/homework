const authTestHelper = require("@src/__tests__/int/authTestHelper");
const {
  API,
  POSTS_ENDPOINT,
} = require("@src/__tests__/int/apiRequests/postApiRequest");

const {
  initDB,
  closeDB,
  clearPostTable,
  clearTagTable,
  clearUserTable,
  createPostsWithTags,
} = require("../endpointsTestHelpers");

describe(`DELETE ${POSTS_ENDPOINT}`, () => {
  let AUTHORIZED_USER;

  beforeAll(async () => {
    await initDB();

    AUTHORIZED_USER = await authTestHelper.createUserWithToken({
      username: "deleteendpoint",
      email: "deleteendpoint@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });
  });

  afterEach(async () => {
    await clearPostTable();
    await clearTagTable();
  });

  afterAll(async () => {
    await clearPostTable();
    await clearTagTable();
    await clearUserTable();
    await closeDB();
  });

  test("should delete a post by id", async () => {
    // 1.create post
    const [newPost] = await createPostsWithTags([
      {
        userId: AUTHORIZED_USER.id,
        title: "sometitle",
        content: "somecontent",
        tags: "gw1",
      },
    ]);

    expect(newPost.id).toBeDefined();
    // 2.delete post
    const res = await API.deletePost(newPost.id, AUTHORIZED_USER.token);

    expect(res.status).toBe(204);
  });

  test("Should not delete someone's else posts (404)", async () => {
    // create a post
    const [firstUserPost] = await createPostsWithTags([
      {
        userId: AUTHORIZED_USER.id,
        title: "sometitle",
        content: "somecontent",
        tags: "gw1",
      },
    ]);

    expect(firstUserPost.id).toBeDefined();
    // login(signup) as someone else and try to delete original post
    const secondUser = await authTestHelper.createUserWithToken({
      username: "anotherUser",
      email: "anotheruser@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });

    // trying to delete original post with second user
    const deleteRes = await API.deletePost(firstUserPost.id, secondUser.token);

    // console.log(deleteRes.text);
    expect(deleteRes.status).toBe(404);
    expect(deleteRes.text).toContain("not found"); // "Post with that id 283 is not found"
  });

  test("Should return 404 if post doesnt exists", async () => {
    const nonExistingId = 999999999;
    const res = await API.deletePost(nonExistingId, AUTHORIZED_USER.token);

    // console.log(res.text);
    expect(res.status).toBe(404);
    expect(res.text).toContain("not found"); // Post with that id 9999999999999999999 is not found
  });

  test("should throw an error on invalid id", async () => {
    const invalidId = "asd";
    const res = await API.deletePost(invalidId, AUTHORIZED_USER.token);
    // console.log(res.text);
    expect(res.status).toBe(400);
    expect(res.text).toContain(`"id" must be a number`); // Post with that id 9999999999999999999 is not found
  });
});
