const authTestHelper = require("@src/__tests__/int/authTestHelper");
const {
  initDB,
  closeDB,
  clearPostTable,
  clearTagTable,
  createPostsWithTags,
  clearUserTable,
} = require("../endpointsTestHelpers");

const {
  API,
  POSTS_ENDPOINT,
} = require("@src/__tests__/int/apiRequests/postApiRequest");

const post1 = {
  title: "random1",
  content: "anything",
  tags: "gw1, gw5",
};

const post2 = {
  title: "random2",
  content: "anything123",
  tags: "gw2, gw6",
};

describe(`GET ${POSTS_ENDPOINT} endpoints`, () => {
  let AUTHORIZED_USER;

  beforeAll(async () => {
    await initDB();

    AUTHORIZED_USER = await authTestHelper.createUserWithToken({
      username: "getEndpoint",
      email: "getEndpoint@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });
  });

  afterEach(async () => {
    await clearPostTable();
    await clearTagTable();
  });

  afterAll(async () => {
    await clearUserTable();
    await clearPostTable();
    await clearTagTable();
    await closeDB();
  });

  test("testing helper bulkCreatePosts (and keeping result in db)", async () => {
    // doesnt support creation of same tags, so they should be unique
    const postsWithTags = await createPostsWithTags([
      {
        userId: AUTHORIZED_USER.id,
        ...post1,
      },
      {
        userId: AUTHORIZED_USER.id,
        ...post2,
      },
    ]);

    // creates post correctly
    expect(postsWithTags[0].title).toBe(post1.title);
    expect(postsWithTags[0].content).toBe(post1.content);
    expect(postsWithTags[1].title).toBe(post2.title);
    expect(postsWithTags[1].content).toBe(post2.content);
    // creates tags correctly
    expect(postsWithTags[0].tags[0].name).toBe("gw1");
    expect(postsWithTags[0].tags[1].name).toBe("gw5");
    expect(postsWithTags[1].tags[0].name).toBe("gw2");
    expect(postsWithTags[1].tags[1].name).toBe("gw6");

    // 2 posts should be created
    expect(postsWithTags).toHaveLength(2);
  });

  describe(`GET ${POSTS_ENDPOINT}`, () => {
    test("should fail when unauthorized", async () => {
      const forgedToken = "a" + AUTHORIZED_USER.token.slice(1);
      const res = await API.getAllPosts(forgedToken);

      expect(res.status).toBe(400);
      expect(res.text).toContain("invalid token");
    });

    test("should get all posts and its tags", async () => {
      // create 2 posts
      await createPostsWithTags([
        {
          userId: AUTHORIZED_USER.id,
          ...post1,
        },
        {
          userId: AUTHORIZED_USER.id,
          ...post2,
        },
      ]);

      const res = await API.getAllPosts(AUTHORIZED_USER.token);
      // console.log(res.text);
      // created 2 posts - should return array with 2 items
      expect(res.body.length).toEqual(2);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[1].id).toBeDefined();
    });
  });

  describe(`GET ${POSTS_ENDPOINT}:id`, () => {
    test("should find post by id", async () => {
      // create post
      const [newPost] = await createPostsWithTags([
        {
          userId: AUTHORIZED_USER.id,
          ...post1,
        },
      ]);
      // find created post
      const res = await API.getOnePost(newPost.id, AUTHORIZED_USER.token);

      // console.log(res.text);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(newPost.id);
      expect(res.body.title).toBe(post1.title);
      expect(res.body.content).toBe(post1.content);
      expect(res.body.tags[0].name).toEqual("gw1");
      expect(res.body.tags[1].name).toEqual("gw5");
    });

    test("should throw 404 if post doesnt exists", async () => {
      const postId = 999999999;
      const res = await API.getOnePost(postId, AUTHORIZED_USER.token);

      expect(res.status).toBe(404);
      expect(res.text).toContain("not found");
    });

    test("should throw an error on invalid id", async () => {
      const invalidId = "asdf";
      const res = await API.getOnePost(invalidId, AUTHORIZED_USER.token);

      expect(res.status).toBe(400);
      expect(res.text).toContain(`"id" must be a number`);
    });
  });
});
