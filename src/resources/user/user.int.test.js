const request = require("supertest");
const app = require("@src/app");
const db = require("@src/database/models/sequelize_db");

const SIGNUP_ENDPOINT = "/api/homework/users/signup";
const LOGIN_ENDPOINT = "/api/homework/users/login";

const USERS_ENDPOINT = "/api/homework/users/";

const username = "testuser";
const email = "supertest@mail.com";
const password = "pass1234";
const repeatPassword = "pass1234";

const NEW_USER_DATA = {
  username,
  email,
  password,
  repeatPassword,
};

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

  describe("Routes that do not require authorization", () => {
    afterEach(async () => {
      await clearUserTable();
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

      test("Should throw an error on dublicate", async () => {
        // creating user
        await request(app).post(SIGNUP_ENDPOINT).send(NEW_USER_DATA);
        // repeating request to try to create dublicate
        const response = await request(app)
          .post(SIGNUP_ENDPOINT)
          .send(NEW_USER_DATA);

        expect(response.status).toBe(400);
        expect(response.text).toBe(`username must be unique`);
      });

      test("Should throw an error on invalid input", async () => {
        const invalidData = {
          username: "@lary",
          email: "@test@mail.com",
          password: "pass1234 --",
          repeatPassword: "pass1234 --",
        };

        const response = await request(app)
          .post(SIGNUP_ENDPOINT)
          .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.text).toBe(
          "Input contains forbidden characters or does not meet the length requirement"
        );
      });
    });

    describe("POST /login", () => {
      test("login correctly when user exists", async () => {
        // 1.create user
        const newUser = await db.sequelize.models.User.create({
          username,
          email,
          password,
        });
        // 2. make sure its created
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

      test("should not allow SQL injection", async () => {
        await db.sequelize.models.User.create({
          username,
          email,
          password,
        });

        const maliciousEmail = "supertest@mail.com' --";
        const maliciousPassword = "anything";

        const result = await request(app).post(LOGIN_ENDPOINT).send({
          email: maliciousEmail,
          password: maliciousPassword,
        });

        expect(result.status).toBe(400);
        expect(result.text).toBe(`"email" must be a valid email`);
      });
    });
  });

  describe("Routes that do require authorization", () => {
    let loggedInUser;
    let validToken;
    // create user and obtain his token
    beforeAll(async () => {
      // creating user and getting his token before checking authorization routes
      const response = await request(app)
        .post(SIGNUP_ENDPOINT)
        .send(NEW_USER_DATA);

      loggedInUser = response.body.user;
      validToken = response.body.token;
    });

    afterAll(async () => {
      await clearUserTable();
    });

    test("Should fail authenthication with invalid token", async () => {
      const forgedToken = "a" + validToken.slice(1);

      const response = await request(app)
        .get(USERS_ENDPOINT)
        .set("Authorization", `Bearer ${forgedToken}`);

      expect(response.text).toBe("invalid token");
      expect(response.status).toBe(400);
    });

    describe("GET /api/homework/users", () => {
      test("Should correctly find an existing user", async () => {
        const response = await request(app)
          .get(USERS_ENDPOINT)
          .set("Authorization", `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body[0].username).toEqual(username);
        expect(response.body[0].email).toEqual(email);
        expect(response.body.length).toEqual(1); // only 1 user was created
      });
    });

    describe("GET /api/homework/users/:id", () => {
      test("should get one user by id", async () => {
        const existingUserId = loggedInUser.id; // ID существующего пользователя

        const response = await request(app)
          .get(`${USERS_ENDPOINT}${existingUserId}`) // Используем более понятное название переменной
          .set("Authorization", `Bearer ${validToken}`); // Передаем токен для авторизации

        // expect valid data
        expect(response.status).toBe(200); // checking status
        expect(response.body.id).toEqual(existingUserId); // check id
        expect(response.body.username).toEqual(loggedInUser.username); // check username
        expect(response.body.email).toEqual(loggedInUser.email); // check email
      });
    });
  });
});
