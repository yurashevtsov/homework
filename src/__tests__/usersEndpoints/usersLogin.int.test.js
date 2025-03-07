const request = require("supertest");
const app = require("@src/app");
const db = require("@src/database/models/sequelize_db");
const { clearUserTable, createUser } = require("./testHelpers");

const LOGIN_ENDPOINT = "/api/homework/users/login";

const username = "sometestuser";
const email = "unauthorizedtest@mail.com";
const password = "pass1234";

describe("Login endpoint", () => {
  beforeAll(async () => {
    await db.sequelize.authenticate();
  });

  afterAll(async () => {
    // clear Users table
    await clearUserTable();
    await db.sequelize.close();
  });

  beforeEach(async () => {
    await clearUserTable(); // clear table before doing a test
  });

  describe(`POST ${LOGIN_ENDPOINT}`, () => {
    test("login correctly when user exists", async () => {
      // 1.create user
      const newUser = await createUser({
        username,
        email,
        password,
      });
      // 2. make sure it's created (basically checking if helper function works)
      expect(newUser.username).toBe(username);
      expect(newUser.email).toBe(email);
      // 3. logging in
      const res = await request(app).post(LOGIN_ENDPOINT).send({
        email,
        password,
      });

      expect(res.body.user.username).toBe(username);
      expect(res.body.user.email).toBe(email);
      expect(res.body.token).toBeDefined();
    });

    test("Should' not' allow SQL injection", async () => {
      const newUser = await createUser({
        username,
        email,
        password,
      });
      // 2. make sure it's created (basically checking if helper function works)
      expect(newUser.username).toBe(username);
      expect(newUser.email).toBe(email);

      const maliciousEmail = email;
      const maliciousPassword = "'' OR '1'='1'";

      const res = await request(app).post(LOGIN_ENDPOINT).send({
        email: maliciousEmail,
        password: maliciousPassword,
      });

      expect(res.status).toBe(400);
      expect(res.body.username).not.toBeDefined();
      expect(res.text).toBe(
        "Password contains forbidden characters or does not meet the length requirement"
      );
    });

    test("Should not work if user doesnt exists", async () => {
      const res = await request(app).post(LOGIN_ENDPOINT).send({
        email: "random@mail.com",
        password: "pass1234",
      });

      expect(res.status).toBe(400);
      expect(res.body.username).not.toBeDefined();
      expect(res.text).toContain("Invalid credentials");
    });
  });
});
