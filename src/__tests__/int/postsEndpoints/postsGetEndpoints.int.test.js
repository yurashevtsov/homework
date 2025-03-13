const request = require("supertest");
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
} = require("../endpointsTestHelpers");

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
  let auhtorizedUser;
  let authToken;
  // created during "test" of a helper function
  let postId;

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

  test("testing helper bulkCreatePosts (and keeping result in db)", async () => {
    // doesnt support creation of same tags, so they should be unique
    const postsWithTags = await createPostsWithTags([
      {
        userId: auhtorizedUser.id,
        ...post1,
      },
      {
        userId: auhtorizedUser.id,
        ...post2,
      },
    ]);

    // since all tests relies on this function it doesnt matter if i'll use this function in subsequent tests or not
    postId = postsWithTags[0].id;

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
      const forgedToken = "a" + authToken.slice(1);
      const res = await request(app)
        .get(POSTS_ENDPOINT)
        .set("Authorization", `Bearer ${forgedToken}`);

      expect(res.status).toBe(400);
      expect(res.text).toContain("invalid token");
    });

    test("should get all posts and its tags", async () => {
      const res = await request(app)
        .get(POSTS_ENDPOINT)
        .set("Authorization", `Bearer ${authToken}`);

      // console.log(res.text);

      expect(res.status).toBe(200);
      expect(res.body[0].title).toBe(post1.title);
      expect(res.body[0].content).toBe(post1.content);
      expect(res.body[1].title).toBe(post2.title);
      expect(res.body[1].content).toBe(post2.content);

      expect(res.body[0].tags[0].name).toBe("gw1");
      expect(res.body[0].tags[1].name).toBe("gw5");
      expect(res.body[1].tags[0].name).toBe("gw2");
      expect(res.body[1].tags[1].name).toBe("gw6");

      expect(res.body.length).toEqual(2);
    });
  });

  describe(`GET ${POSTS_ENDPOINT}:id`, () => {
    test("should find post by id", async () => {
      const res = await request(app)
        .get(`${POSTS_ENDPOINT}${postId}`)
        .set("Authorization", `Bearer ${authToken}`);

      // console.log(res.text);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(postId);
      expect(res.body.title).toBe(post1.title);
      expect(res.body.content).toBe(post1.content);
      expect(res.body.tags[0].name).toEqual("gw1");
      expect(res.body.tags[1].name).toEqual("gw5");
    });

    test("should throw 404 if post doesnt exists", async () => {
      const postId = 999999999;
      const res = await request(app)
        .get(`${POSTS_ENDPOINT}${postId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.text).toContain("not found");
    });

    test("should throw an error", async () => {
      const invalidId = "asdf";
      const res = await request(app)
        .get(`${POSTS_ENDPOINT}${invalidId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.text).toContain(`"id" must be a number`);
    });
  });
});
