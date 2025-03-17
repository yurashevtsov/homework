const request = require("supertest");
const app = require("@src/app");
const {
  clearUserTable,
  initDB,
  closeDB,
} = require("@src/__tests__/int/endpointsTestHelpers");

const USERS_ENDPOINT = "/api/homework/users/";
const authTestHelper = require("@src/__tests__/int/authTestHelper");

describe("Endpoint require authorization", () => {
  let AUTHORIZED_USER;

  beforeAll(async () => {
    await initDB();

    AUTHORIZED_USER = await authTestHelper.createUserWithToken({
      username: "postUser",
      email: "postuser@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });
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
        .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toEqual(1); // only 1 user was created initially
      expect(res.body[0].username).toEqual(AUTHORIZED_USER.username);
      expect(res.body[0].email).toEqual(AUTHORIZED_USER.email);
    });

    test("Should fail authentication with invalid token", async () => {
      const forgedToken = "a" + AUTHORIZED_USER.token.slice(1);

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
        .get(`${USERS_ENDPOINT}${AUTHORIZED_USER.id}`)
        .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toEqual(AUTHORIZED_USER.id);
      expect(res.body.username).toEqual(AUTHORIZED_USER.username);
      expect(res.body.email).toEqual(AUTHORIZED_USER.email);
    });

    test("should throw an error 404 if non-existing user", async () => {
      const userId = 99999999999;
      const res = await request(app)
        .get(`${USERS_ENDPOINT}${userId}`)
        .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`);

      // console.log(res.text);
      expect(res.status).toBe(404);
      expect(res.text).toContain("User is not found");
    });

    test("should throw an error on invalid id", async () => {
      const invalidUserId = "asdf";
      const res = await request(app)
        .get(`${USERS_ENDPOINT}${invalidUserId}`)
        .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`);

      // console.log(res.text);
      expect(res.status).toBe(400);
      expect(res.text).toContain(`"id" must be a number`);
    });

    test("Should fail authentication with invalid token", async () => {
      const forgedToken = "a" + AUTHORIZED_USER.token.slice(1);

      const res = await request(app)
        .get(`${USERS_ENDPOINT}${AUTHORIZED_USER.id}`)
        .set("Authorization", `Bearer ${forgedToken}`);

      expect(res.status).toBe(400);
      expect(res.text).toContain("invalid token");
    });
  });
});
