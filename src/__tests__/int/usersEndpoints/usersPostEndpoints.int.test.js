const request = require("supertest");
const app = require("@src/app");
const {
  clearUserTable,
  partialUserTableClear,
  findUserById,
  initDB,
  closeDB,
} = require("../endpointsTestHelpers");

const USERS_ENDPOINT = "/api/homework/users/";
const authTestHelper = require("@src/__tests__/int/authTestHelper");

describe(`POST ${USERS_ENDPOINT}`, () => {
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

  afterEach(async () => {
    await partialUserTableClear(AUTHORIZED_USER.id);
  });

  afterAll(async () => {
    // Clear Users table and close db
    await clearUserTable();
    await closeDB();
  });

  test("should create a new user with valid input", async () => {
    const res = await request(app)
      .post(USERS_ENDPOINT)
      .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`)
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
      .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`)
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
    const forgedToken = "a" + AUTHORIZED_USER.token.slice(1);

    const res = await request(app)
      .post(USERS_ENDPOINT)
      .set("Authorization", `Bearer ${forgedToken}`)
      .send({
        username: "postUser",
        email: "postuser@mail.com",
        password: "pass1234",
        repeatPassword: "pass1234",
      });

    expect(res.status).toBe(400);
    expect(res.text).toContain("invalid token");
  });
});
