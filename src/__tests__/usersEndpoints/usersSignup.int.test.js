const request = require("supertest");
const app = require("@src/app");
const db = require("@src/database/models/sequelize_db");
const { clearUserTable, findUserById } = require("./testHelpers");

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

describe("Signup endpoint", () => {
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

  describe(`POST ${SIGNUP_ENDPOINT}`, () => {
    test("should create a new user", async () => {
      // signing up
      const res = await request(app).post(SIGNUP_ENDPOINT).send(NEW_USER_DATA);

      // making sure user exists in the db
      const createdUser = await findUserById(res.body.user.id);

      expect(res.status).toBe(201);
      expect(res.body.user.username).toEqual(username);
      expect(res.body.user.email).toEqual(email);
      expect(res.body.user).not.toHaveProperty("password");
      expect(res.body).toHaveProperty("token");
      // making sure that user was created in db
      expect(createdUser).toHaveProperty("id");
      expect(createdUser).toHaveProperty("username");
      expect(createdUser).toHaveProperty("email");
    });

    test("Should not create a duplicate", async () => {
      // creating user
      await request(app).post(SIGNUP_ENDPOINT).send(NEW_USER_DATA);
      // repeating request to try to create duplicate
      const res = await request(app).post(SIGNUP_ENDPOINT).send(NEW_USER_DATA);

      expect(res.status).toBe(400);
      expect(res.text).toBe(`username must be unique`);
    });

    test("Should throw an error on invalid input(password)", async () => {
      const invalidData = {
        username: "lary",
        email: "test@mail.com",
        password: "pass1234 --",
        repeatPassword: "pass1234 --",
      };

      const invalidPasswordResponse = await request(app)
        .post(LOGIN_ENDPOINT)
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
});
