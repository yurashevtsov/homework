const request = require("supertest");
const app = require("@src/app");
const {
  clearUserTable,
  createUser,
  closeDB,
  initDB,
} = require("../endpointsTestHelpers");

const LOGIN_ENDPOINT = "/api/homework/users/login";

describe("Login endpoint", () => {
  beforeAll(async () => {
    await initDB();
  });

  beforeEach(async () => {
    await clearUserTable();
  });

  afterAll(async () => {
    // clear Users table
    await clearUserTable();
    await closeDB();
  });

  describe(`POST ${LOGIN_ENDPOINT}`, () => {
    test("login correctly when user exists", async () => {
      // 1.create user
      const createdUser = await createUser({
        username: "loginendpoint",
        email: "loginendpoint@gmail.com",
        password: "pass1234",
        repeatPassword: "pass1234",
      });

      // 2. logging in
      const res = await request(app).post(LOGIN_ENDPOINT).send({
        email: "loginendpoint@gmail.com",
        password: "pass1234",
      });

      expect(res.body.user.username).toBe(createdUser.username);
      expect(res.body.user.email).toBe(createdUser.email);
      expect(res.body.token).toBeDefined();
    });

    test("Should' not' allow SQL injection", async () => {
      const email = "loginendpoint@gmail.com";
      const maliciousPassword = "'' OR '1'='1'";

      await createUser({
        username: "loginendpoint",
        email,
        password: "pass1234",
        repeatPassword: "pass1234",
      });

      const res = await request(app).post(LOGIN_ENDPOINT).send({
        email,
        password: maliciousPassword,
      });

      expect(res.status).toBe(400);
      expect(res.text).toContain(
        "Password contains forbidden characters or does not meet the length requirement"
      );
    });

    test("Should not work if user doesnt exists", async () => {
      const res = await request(app).post(LOGIN_ENDPOINT).send({
        email: "random@mail.com",
        password: "pass1234",
      });

      expect(res.status).toBe(400);
      expect(res.text).toContain("Invalid credentials");
    });
  });
});
