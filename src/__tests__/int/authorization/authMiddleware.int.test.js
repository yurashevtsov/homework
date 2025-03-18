const request = require("supertest");
const app = require("@src/app");

const {
  initDB,
  closeDB,
  clearUserTable,
} = require("@src/__tests__/int/endpointsTestHelpers");

const authTestHelper = require("@src/__tests__/int/authTestHelper");
const {
  API,
  USERS_ENDPOINT,
} = require("@src/__tests__/int/apiRequests/userApiRequests");

describe("Authorization middleware", () => {
  beforeAll(async () => {
    await initDB();
  });

  afterEach(async () => {
    await clearUserTable();
  });

  afterAll(async () => {
    await clearUserTable();
    await closeDB();
  });

  test("should allow authorized users to access protected routes", async () => {
    const newUser = await authTestHelper.createUserWithToken({
      username: "validUsername",
      email: "validemail@gmail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });

    const res = await API.getAllUsers(newUser.token);

    // console.log(res.body);
    expect(res.status).toBe(200);
  });

  test("return 400 if token is not provided", async () => {
    const res = await API.getAllUsers("");

    expect(res.status).toBe(401);
    expect(res.text).toContain("Token is missing");
  });

  test("should return 400 if token does not have AUTHENTICATION scope", async () => {
    // create token with wrong scope
    const wrongScopeToken = authTestHelper.encodeToken(
      { id: 123 },
      "invalidScope"
    );

    const res = await API.getAllUsers(wrongScopeToken);

    // console.log(res.text);
    expect(res.status).toBe(401);
    expect(res.text).toContain("Token does not have required scope");
  });

  test("Shouldnt allow access if owner of JWT was deleted", async () => {
    const deletedUserId = 10;
    const deletedUserToken = authTestHelper.encodeToken(
      { id: deletedUserId },
      "AUTHENTICATION"
    );

    const res = await API.getAllUsers(deletedUserToken);

    // console.log(res.text);
    expect(res.status).toBe(404);
    expect(res.text).toContain("User not found");
  });

  test("Shouldnt throw an error if token has expired", async () => {
    const expiredToken = authTestHelper.createExpiredToken(
      { id: 10 },
      "AUTHENTICATION"
    );

    const res = await API.getAllUsers(expiredToken);

    // console.log(res.text);
    expect(res.status).toBe(401);
    expect(res.text).toContain("jwt expired");
  });

  test("Should throw an error if user changed password after token was issued", async () => {
    // create user
    const createdUser = await authTestHelper.createUserWithToken({
      username: "authUser",
      email: "authuser@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });
    // imitate that user was created
    const backDateToken = authTestHelper.createBackdateToken(
      { id: createdUser.id },
      "AUTHENTICATION"
    );

    // change his password
    createdUser.set({ password: "pass4321" });
    await createdUser.save();
    // trying to access protected route
    const res = await API.getAllUsers(backDateToken);

    // console.log(res.text);
    expect(res.status).toBe(401);
    expect(res.text).toContain(
      "User recently changed his password. Please login again"
    );
  });
});
