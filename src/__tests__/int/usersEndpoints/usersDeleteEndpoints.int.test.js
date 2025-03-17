const request = require("supertest");
const app = require("@src/app");
const {
  initDB,
  clearUserTable,
  partialUserTableClear,
  createUser,
  closeDB,
} = require("../endpointsTestHelpers");

const USERS_ENDPOINT = "/api/homework/users/";
const authTestHelper = require("@src/__tests__/int/authTestHelper");

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

    const res = await request(app)
      .get(USERS_ENDPOINT)
      .set("Authorization", `Bearer ${forgedToken}`);

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
    const res = await request(app)
      .delete(`${USERS_ENDPOINT}${userToDelete.id}`)
      .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`);
    // dont expect any errors
    expect(res.status).toBe(204);
  });

  test("should return 404 if non-existing user", async () => {
    const res = await request(app)
      .delete(`${USERS_ENDPOINT}99999999999999`)
      .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`);

    // uncomment to see error message
    // console.log(res.text);
    expect(res.status).toBe(404);
    expect(res.text).toContain("User is not found");
  });
});
