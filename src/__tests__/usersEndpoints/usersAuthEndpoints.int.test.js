const request = require("supertest");
const app = require("@src/app");
const db = require("@src/database/models/sequelize_db");
const { Op } = require("sequelize");

const SIGNUP_ENDPOINT = "/api/homework/users/signup";
const USERS_ENDPOINT = "/api/homework/users/";
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

async function clearUserTable() {
  await db.sequelize.models.User.destroy({
    where: {},
  });
}

async function partialUserTableClear(value) {
  await db.sequelize.models.User.destroy({
    where: {
      id: {
        [Op.ne]: value,
      },
    },
  });
}

// to avoid logging in after password change etc, less painful than supertest
async function findUserById(id) {
  return await db.sequelize.models.User.findOne({
    where: {
      id,
    },
  });
}

describe("Endpoints that REQUIRE authorization", () => {
  let auhtorizedUser;
  let authToken;

  // Connecting to a database
  beforeAll(async () => {
    await db.sequelize.authenticate();

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
    await db.sequelize.close();
  });

  test("Should fail authentication with invalid token", async () => {
    const forgedToken = "a" + authToken.slice(1);

    const response = await request(app)
      .get(USERS_ENDPOINT)
      .set("Authorization", `Bearer ${forgedToken}`);

    expect(response.status).toBe(400);
    expect(response.text).toContain("invalid token");
  });

  describe("GET /api/homework/users", () => {
    test("Should correctly find existing users", async () => {
      const response = await request(app)
        .get(USERS_ENDPOINT)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toEqual(1); // only 1 user was created initially
      expect(response.body[0].username).toEqual(auhtorizedUser.username);
      expect(response.body[0].email).toEqual(auhtorizedUser.email);
    });
  });

  describe("GET /api/homework/users/:id", () => {
    test("should get one user by id", async () => {
      const response = await request(app)
        .get(`${USERS_ENDPOINT}${auhtorizedUser.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toEqual(auhtorizedUser.id);
      expect(response.body.username).toEqual(auhtorizedUser.username);
      expect(response.body.email).toEqual(auhtorizedUser.email);
    });

    test("should return 404 if non-existing user", async () => {
      const response = await request(app)
        .get(`${USERS_ENDPOINT}99999999999999999999`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.text).toContain("User is not found");
    });
  });

  describe("PUT /api/homework/users/:id", () => {
    // CLEARING DB (not pre-defined user) after each test
    afterEach(async () => {
      await partialUserTableClear(auhtorizedUser.id);
    });

    test("should correctly update user (username,password,avatar)", async () => {
      // have to create another user for this tests
      const secondUser = await request(app).post(SIGNUP_ENDPOINT).send({
        username: "fancybackup",
        email: "updatetest@mail.com",
        password: "pass1234",
        repeatPassword: "pass1234",
      });

      // updating user fields
      const updateResponse = await request(app)
        .put(`${USERS_ENDPOINT}${secondUser.body.user.id}`)
        .set("Authorization", `Bearer ${secondUser.body.token}`)
        .send({
          // fields that should be updated (email is not allowed)
          username: "updatedUser",
          avatar: "avatarmeme.jpg",
          password: "pass12345",
          repeatPassword: "pass12345",
        });

      // to make sure, it was really updated in DB
      const updatedUser = await findUserById(secondUser.body.user.id);

      // uncomment to see error message just in case
      //console.log(updateResponse.text);
      expect(updateResponse.status).toBe(200); // initial response on update
      expect(updatedUser.username).toEqual("updatedUser");
      expect(updatedUser.avatar).toEqual("avatarmeme.jpg");
    });

    test("should throw an error if trying to change email", async () => {
      // have to create another user for this tests
      const secondUser = await request(app).post(SIGNUP_ENDPOINT).send({
        username: "fancybackup",
        email: "updatetest@mail.com",
        password: "pass1234",
        repeatPassword: "pass1234",
      });

      // updating user fields
      const updateResponse = await request(app)
        .put(`${USERS_ENDPOINT}${secondUser.body.user.id}`)
        .set("Authorization", `Bearer ${secondUser.body.token}`)
        .send({
          // fields that should be updated (email is not allowed)
          username: "updatedUser",
          avatar: "avatarmeme.jpg",
          email: "anyemail@mail.com",
          password: "pass12345",
          repeatPassword: "pass12345",
        });

      expect(updateResponse.status).toBe(400);
      expect(updateResponse.text).toContain(`"email" is not allowed`);
    });

    test("should return 404 if non-existing user", async () => {
      const response = await request(app)
        .put(`${USERS_ENDPOINT}99999999999`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          // fields that should be updated (email is not allowed)
          username: "updatedUser",
          avatar: "avatarmeme.jpg",
          password: "pass12345",
          repeatPassword: "pass12345",
        });

      expect(response.status).toBe(404);
      expect(response.text).toContain("User is not found");
    });
  });

  // ! add CREATE USER tests
  
  //! finish this 
  describe("DELETE /api/homework/users/:id", () => {
    test("should correctly delete a user", async () => {
      // uncomment to see error message just in case
      //console.log(updateResponse.text);
    });

    test("should return 404 if non-existing user", async () => {});
  });
});
