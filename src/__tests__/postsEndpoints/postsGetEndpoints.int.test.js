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

describe("Requires authorization", () => {
  let auhtorizedUser;
  let authToken;

  beforeAll(async () => {
    await db.sequelize.authenticate();

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
    await clearUserTable();
    await clearPostTable();
    await clearTagTable();

    await db.sequelize.close();
  });

  describe("Testing helper (it will be used to find posts)", () => {
    test("testing helper bulkCreatePosts (and keeping result in db)", async () => {
      // doesnt support creation of same tags, so they should be unique
      const postsWithTags = await createPostsWithTags([
        {
          userId: auhtorizedUser.id,
          title: "random1",
          content: "anything",
          tags: "gw1, gw5",
        },
        {
          userId: auhtorizedUser.id,
          title: "random2",
          content: "anything123",
          tags: "gw2, gw6",
        },
      ]);

      // creates post correctly
      expect(postsWithTags[0].title).toBe("random1");
      expect(postsWithTags[0].content).toBe("anything");
      expect(postsWithTags[1].title).toBe("random2");
      expect(postsWithTags[1].content).toBe("anything123");
      // creates tags correctly
      expect(postsWithTags[0].tags[0].name).toBe("gw1");
      expect(postsWithTags[0].tags[1].name).toBe("gw5");
      expect(postsWithTags[1].tags[0].name).toBe("gw2");
      expect(postsWithTags[1].tags[1].name).toBe("gw6");
      // 2 posts should be created
      expect(postsWithTags).toHaveLength(2);
    });
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

      console.log(res.text);

      expect(res.status).toBe(200);
      expect(res.body[0].title).toBe("random1");
      expect(res.body[0].content).toBe("anything");
      expect(res.body[1].title).toBe("random2");
      expect(res.body[1].content).toBe("anything123");

      expect(res.body[0].tags[0].name).toBe("gw1");
      expect(res.body[0].tags[1].name).toBe("gw5");
      expect(res.body[1].tags[0].name).toBe("gw2");
      expect(res.body[1].tags[1].name).toBe("gw6");

      expect(res.body.length).toEqual(2);
    });
  });
});
