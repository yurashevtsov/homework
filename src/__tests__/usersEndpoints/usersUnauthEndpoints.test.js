const request = require("supertest");
const app = require("@src/app");
const db = require("@src/database/models/sequelize_db");

const SIGNUP_ENDPOINT = "/api/homework/users/signup";
const LOGIN_ENDPOINT = "/api/homework/users/login";

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

async function createUser(userData) {
  return await db.sequelize.models.User.create(userData);
}

async function clearUserTable() {
  await db.sequelize.models.User.destroy({
    where: {},
  });
}

describe("/api/homework/users", () => {
  beforeAll(async () => {
    await db.sequelize.authenticate();
  });

  afterAll(async () => {
    // clear Users table
    await clearUserTable();
    await db.sequelize.close();
  });

  describe("Endpoints that do NOT require authorization", () => {
    beforeEach(async () => {
      await clearUserTable(); // clear table before doing a test
    });

    describe("POST /signup", () => {
      test("should create a new user", async () => {
        const response = await request(app)
          .post(SIGNUP_ENDPOINT)
          .send(NEW_USER_DATA);

        expect(response.status).toBe(201);
        expect(response.body.user.username).toEqual(username);
        expect(response.body.user.email).toEqual(email);
        expect(response.body.user).not.toHaveProperty("password");
        expect(response.body).toHaveProperty("token");
      });

      test("Should not create a duplicate", async () => {
        // creating user
        await request(app).post(SIGNUP_ENDPOINT).send(NEW_USER_DATA);
        // repeating request to try to create duplicate
        const response = await request(app)
          .post(SIGNUP_ENDPOINT)
          .send(NEW_USER_DATA);

        expect(response.status).toBe(400);
        expect(response.text).toBe(`username must be unique`);
      });

      test("Should throw an error on invalid input(password)", async () => {
        const invalidData = {
          username: "lary",
          email: "test@mail.com",
          password: "pass1234 --",
          repeatPassword: "pass1234 --",
        };

        const invalidPasswordResponse = await request(app)
          .post(SIGNUP_ENDPOINT)
          .send(invalidData);

        expect(invalidPasswordResponse.status).toBe(400);
        expect(invalidPasswordResponse.text).toBe(
          "Password contains forbidden characters or does not meet the length requirement"
        );
      });

      test("Should throw an error on invalid input(username)", async () => {
        const invalidData = {
          username: "@lary",
          email: "test@mail.com",
          password: "pass1234",
          repeatPassword: "pass1234",
        };

        const invalidPasswordResponse = await request(app)
          .post(SIGNUP_ENDPOINT)
          .send(invalidData);

        expect(invalidPasswordResponse.status).toBe(400);
        expect(invalidPasswordResponse.text).toBe(
          "Username contains forbidden characters or does not meet the length requirement"
        );
      });
    });

    describe("POST /login", () => {
      test("login correctly when user exists", async () => {
        // 1.create user
        const newUser = await createUser({
          username,
          email,
          password,
        });
        // 2. make sure it's created
        expect(newUser.username).toBe(username);
        expect(newUser.email).toBe(email);
        // 3. logging in
        const response = await request(app).post(LOGIN_ENDPOINT).send({
          email,
          password,
        });

        expect(response.body.user.username).toBe(username);
        expect(response.body.user.email).toBe(email);
        expect(response.body.token).toBeDefined();
      });

      test("Should' not' allow SQL injection", async () => {
        await createUser({
          username,
          email,
          password,
        });

        const maliciousEmail = email;
        const maliciousPassword = "'' OR '1'='1'";

        const response = await request(app).post(LOGIN_ENDPOINT).send({
          email: maliciousEmail,
          password: maliciousPassword,
        });

        expect(response.status).toBe(400);
        expect(response.body.username).not.toBeDefined();
        expect(response.text).toBe(
          "Password contains forbidden characters or does not meet the length requirement"
        );
      });

      test("Should not work if user doesnt exists", async () => {
        const response = await request(app).post(LOGIN_ENDPOINT).send({
          email: "random@mail.com",
          password: "pass1234",
        });

        expect(response.status).toBe(400);
        expect(response.body.username).not.toBeDefined();
        expect(response.text).toContain("Invalid credentials");
      });
    });
  });
});
