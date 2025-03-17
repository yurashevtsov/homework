const request = require("supertest");
const app = require("@src/app");
const {
  initDB,
  clearUserTable,
  partialUserTableClear,
  createUser,
  closeDB,
} = require("../endpointsTestHelpers");

const authTestHelper = require("@src/__tests__/int/authTestHelper");
const { API, USERS_ENDPOINT } = require("@src/__tests__/int/apiRequests");

describe(`DELETE ${USERS_ENDPOINT}:id`, () => {
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

  // CLEARING DB (not pre-defined user) after each test
  afterEach(async () => {
    await partialUserTableClear(AUTHORIZED_USER.id);
  });

  afterAll(async () => {
    // Clear Users table and close db
    await clearUserTable();
    await closeDB();
  });

  test("Should fail authentication with invalid token", async () => {
    const forgedToken = "a" + AUTHORIZED_USER.token.slice(1);

    const res = await API.deleteUser(AUTHORIZED_USER.id, forgedToken);

    expect(res.status).toBe(400);
    expect(res.text).toContain("invalid token");
  });

  test("should correctly delete a user", async () => {
    // creating user
    const userToDelete = await createUser({
      username: "deleteMe",
      email: "deletethis@mail.com",
      password: "pass1234",
    });
    // deleting user
    const res = await API.deleteUser(userToDelete.id, AUTHORIZED_USER.token);

    // dont expect any errors
    expect(res.status).toBe(204);
  });

  test("should return 404 if non-existing user", async () => {
    const userId = 999999999;
    const res = await API.deleteUser(userId, AUTHORIZED_USER.token);

    // uncomment to see error message
    // console.log(res.text);
    expect(res.status).toBe(404);
    expect(res.text).toContain("User is not found");
  });
});
