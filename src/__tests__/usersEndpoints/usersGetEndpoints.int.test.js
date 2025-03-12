const request = require("supertest");
const app = require("@src/app");
const { clearUserTable, initDB, closeDB } = require("../endpointsTestHelpers");

const SIGNUP_ENDPOINT = "/api/homework/users/signup";
const USERS_ENDPOINT = "/api/homework/users/";

const username = "sometestuser";
const email = "unauthorizedtest@mail.com";
const password = "pass1234";
const repeatPassword = "pass1234";

const NEW_USER_DATA = {
  username,
  email,
  password,
  repeatPassword,
};

describe("Endpoint require authorization", () => {
  let auhtorizedUser;
  let authToken;

  // Connecting to a database
  beforeAll(async () => {
    await initDB();

    // Create user before testing authorization routes
    const response = await request(app)
      .post(SIGNUP_ENDPOINT)
      .send(NEW_USER_DATA);

    auhtorizedUser = response.body.user;
    authToken = response.body.token;
  });

  afterAll(async () => {
    // Clear Users table and close db
    await clearUserTable();
    await closeDB();
  });

  describe(`GET ${USERS_ENDPOINT}`, () => {
    test("Should correctly find existing users", async () => {
      const res = await request(app)
        .get(USERS_ENDPOINT)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toEqual(1); // only 1 user was created initially
      expect(res.body[0].username).toEqual(auhtorizedUser.username);
      expect(res.body[0].email).toEqual(auhtorizedUser.email);
    });

    test("Should fail authentication with invalid token", async () => {
      const forgedToken = "a" + authToken.slice(1);

      const res = await request(app)
        .get(USERS_ENDPOINT)
        .set("Authorization", `Bearer ${forgedToken}`);

      expect(res.status).toBe(400);
      expect(res.text).toContain("invalid token");
    });
  });

  describe(`GET ${USERS_ENDPOINT}:id`, () => {
    test("should get one user by id", async () => {
      const res = await request(app)
        .get(`${USERS_ENDPOINT}${auhtorizedUser.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toEqual(auhtorizedUser.id);
      expect(res.body.username).toEqual(auhtorizedUser.username);
      expect(res.body.email).toEqual(auhtorizedUser.email);
    });

    test("should throw an error 404 if non-existing user", async () => {
      const userId = 999999999999;
      const res = await request(app)
        .get(`${USERS_ENDPOINT}${userId}`)
        .set("Authorization", `Bearer ${authToken}`);

      // console.log(res.text);
      expect(res.status).toBe(404);
      expect(res.text).toContain("User is not found");
    });

    test("should throw an error on invalid id", async () => {
      const invalidUserId = "asdf";
      const res = await request(app)
        .get(`${USERS_ENDPOINT}${invalidUserId}`)
        .set("Authorization", `Bearer ${authToken}`);

      // console.log(res.text);
      expect(res.status).toBe(400);
      expect(res.text).toContain(`"id" must be a number`);
    });

    test("Should fail authentication with invalid token", async () => {
      const forgedToken = "a" + authToken.slice(1);

      const res = await request(app)
        .get(`${USERS_ENDPOINT}${auhtorizedUser.id}`)
        .set("Authorization", `Bearer ${forgedToken}`);

      expect(res.status).toBe(400);
      expect(res.text).toContain("invalid token");
    });
  });
});
