const request = require("supertest");
const app = require("@src/app");
const {
  clearUserTable,
  partialUserTableClear,
  findUserById,
  initDB,
  closeDB,
} = require("../testHelpers");

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

describe("Require authorization", () => {
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

  describe("POST /api/homework/users", () => {
    // this just creates user, no token
    // CLEARING DB (not pre-defined user) after each test
    afterEach(async () => {
      await partialUserTableClear(auhtorizedUser.id);
    });

    test("should create a new user with valid input", async () => {
      const res = await request(app)
        .post(USERS_ENDPOINT)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          username: "testuser1234",
          email: "test1234@example.com",
          avatar: "somefancyavatar.png",
          password: "password1234",
          repeatPassword: "password1234",
        });

      // console.log(res.text);
      expect(res.status).toBe(201);
      expect(res.body.username).toBeDefined();
      expect(res.body.email).toBeDefined();
      expect(res.body.password).not.toBeDefined();

      const user = await findUserById(res.body.id);
      expect(user.username).toBe("testuser1234");
      expect(user.email).toBe("test1234@example.com");
      expect(user.password).not.toBeDefined();
    });

    test("Should throw an error on missing field", async () => {
      const res = await request(app)
        .post(USERS_ENDPOINT)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          username: "testuser1234",
          email: "test1234@example.com",
          avatar: "somefancyavatar.png",
          password: "password1234",
          //missing field repeatPassword: "password1234",
        });

      // console.log(res.text);
      expect(res.status).toBe(400);
      expect(res.text).toContain("is required");
    });

    test("Should fail authentication with invalid token", async () => {
      const forgedToken = "a" + authToken.slice(1);

      const res = await request(app)
        .post(USERS_ENDPOINT)
        .set("Authorization", `Bearer ${forgedToken}`)
        .send(NEW_USER_DATA);

      expect(res.status).toBe(400);
      expect(res.text).toContain("invalid token");
    });
  });
});
