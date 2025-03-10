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
  findPostWithTags,
} = require("../testHelpers");

describe(`POST ${POSTS_ENDPOINT}`, () => {
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
    await Promise.all([clearPostTable(), clearTagTable(), clearUserTable()]);
    await closeDB();
  });

  test("Should create a post and tags", async () => {
    const res = await request(app)
      .post(POSTS_ENDPOINT)
      .set("Authorization", `Bearer ${authToken}`)
      .send(POST_TO_CREATE);

    // find the same post that was created
    const fetchedPost = (
      await findPostWithTags(res.body.id, auhtorizedUser.id)
    ).toJSON();

    // created status
    expect(res.status).toBe(201);
    // checking for posts to be really created in DB
    expect(res.body.title).toBe(fetchedPost.title);
    expect(res.body.content).toBe(fetchedPost.content);
    // checking tags
    // condition to check if all created tags are included in initial request
    const includesAllCreatedTags = res.body.tags
      .map((tag) => tag.name)
      .every((tagName) => POST_TO_CREATE.tags.includes(tagName));
    // condition to check if all fetched tags from DB are included in initial request
    const includesAllFetchedTags = fetchedPost.tags
      .map((tag) => tag.name)
      .every((tagName) => POST_TO_CREATE.tags.includes(tagName));

    expect(includesAllCreatedTags).toBe(true); // checking tags after creation
    expect(includesAllFetchedTags).toBe(true); // checking tags to be saved in DB
  });

  test("Should throw an error on missing fields", async () => {
    const testCases = [
      {
        body: {
          title: "title",
          content: "content",
          // tags: "missing"
        },
        expectedField: "tags",
        expectedMessage: `"tags" is required`,
      },
      {
        body: {
          title: "title2",
          // content: "content2",
          tags: "missing2",
        },
        expectedField: "content",
        expectedMessage: `"content" is required`,
      },
      {
        body: {
          // title: "title3",
          content: "content3",
          tags: "missing3",
        },
        expectedField: "title",
        expectedMessage: `"title" is required`,
      },
    ];

    await Promise.all(
      testCases.map(async (testCase, index) => {
        const res = await request(app)
          .post(POSTS_ENDPOINT)
          .set("Authorization", `Bearer ${authToken}`)
          .send(testCase.body);

        if (
          res.status !== 400 ||
          !res.text.includes(testCase.expectedMessage)
        ) {
          throw new Error(
            `Test case ${index + 1} failed. Expected message: ${
              testCase.expectedMessage
            }, but received: ${res.text}`
          );
        }

        expect(res.status).toBe(400);
        expect(res.text).toContain(testCase.expectedMessage);
      })
    );
  });
});
