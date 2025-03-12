const request = require("supertest");
const app = require("@src/app");

const TAGS_ENDPOINT = "/api/homework/tags/";
const SIGNUP_ENDPOINT = "/api/homework/users/signup";

const {
  initDB,
  closeDB,
  clearUserTable,
  clearTagTable,
  createTags,
} = require("@src/__tests__/endpointsTestHelpers");

describe(`GET tags endpoints`, () => {
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

  afterEach(async () => {
    await clearTagTable();
  });

  afterAll(async () => {
    await Promise.all([clearUserTable(), clearTagTable()]);
    await closeDB();
  });

  describe("", () => {
    test("should", async () => {});
  });
});
