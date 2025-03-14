const request = require("supertest");
const app = require("@src/app");
const {
  initDB,
  clearUserTable,
  partialUserTableClear,
  createUser,
  closeDB,
} = require("../endpointsTestHelpers");

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

describe(`DELETE ${USERS_ENDPOINT}:id`, () => {
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

  // CLEARING DB (not pre-defined user) after each test
  afterEach(async () => {
    await partialUserTableClear(auhtorizedUser.id);
  });

  afterAll(async () => {
    // Clear Users table and close db
    await clearUserTable();
    await closeDB();
  });

  test("Should fail authentication with invalid token", async () => {
    const forgedToken = "a" + authToken.slice(1);

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
      .set("Authorization", `Bearer ${authToken}`);
    // dont expect any errors
    expect(res.status).toBe(204);
  });

  test("should return 404 if non-existing user", async () => {
    const res = await request(app)
      .delete(`${USERS_ENDPOINT}99999999999999`)
      .set("Authorization", `Bearer ${authToken}`);

    // uncomment to see error message
    // console.log(res.text);
    expect(res.status).toBe(404);
    expect(res.text).toContain("User is not found");
  });
});
