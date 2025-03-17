const authTestHelper = require("@src/__tests__/int/authTestHelper");
const {
  API,
  POSTS_ENDPOINT,
} = require("@src/__tests__/int/apiRequests/postApiRequest");

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

describe(`PUT ${POSTS_ENDPOINT}:id`, () => {
  let AUTHORIZED_USER;

  beforeAll(async () => {
    await initDB();

    AUTHORIZED_USER = await authTestHelper.createUserWithToken({
      username: "putEndpoint",
      email: "putEndpoint@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });
  });

  afterEach(async () => {
    // clearing table/tags tables after each test
    await clearPostTable();
    await clearTagTable();
  });

  afterAll(async () => {
    await Promise.all([clearUserTable(), clearPostTable(), clearTagTable()]);
    await closeDB();
  });

  test("should update post data", async () => {
    const updatePostData = {
      title: "updated title",
      content: "updated content",
    };
    // create post that we can update
    const [createdPost] = await createPostsWithTags([
      { userId: AUTHORIZED_USER.id, ...POST_TO_CREATE },
    ]);

    // request to update created post
    const updateRes = await API.updatePost(
      createdPost.id,
      AUTHORIZED_USER.token,
      updatePostData
    );

    // console.log(updateRes.text);
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.title).toBe(updatePostData.title);
    expect(updateRes.body.content).toBe(updatePostData.content);
  });

  test("should update tags data", async () => {
    const tagsToUpdate = "yolo, fun";
    // create post that we can update
    const [createdPost] = await createPostsWithTags([
      { userId: AUTHORIZED_USER.id, ...POST_TO_CREATE },
    ]);

    // request to update created post
    const updateRes = await API.updatePost(
      createdPost.id,
      AUTHORIZED_USER.token,
      { tags: tagsToUpdate }
    );

    // console.log(updateRes.text);

    // `updatedRes.body.tags` wil look like this  [ { id: 119, name: 'yolo' }, { id: 120, name: 'fun' } ]
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
    // create a post with tags by created user (before tests)
    const [firstUserPost] = await createPostsWithTags([
      { userId: AUTHORIZED_USER.id, ...POST_TO_CREATE },
    ]);

    // create a new user
    const secondUser = await authTestHelper.createUserWithToken({
      username: "seconduser",
      email: "seconduser@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });

    // use new token to edit post created by first user
    const updateRes = await API.updatePost(firstUserPost.id, secondUser.token, {
      title: "Yoho",
    });

    // console.log(updateRes.text);
    expect(updateRes.status).toBe(404); // get 404 error
    expect(updateRes.text).toContain(`not found`);
  });

  test("should throw an error on invalid id", async () => {
    const invalidId = "asdf";
    const updateRes = await API.updatePost(invalidId, AUTHORIZED_USER.token, {
      title: "Yo",
    });

    expect(updateRes.status).toBe(400);
    expect(updateRes.text).toBe(`"id" must be a number`);
  });
});
