const request = require("supertest");
const app = require("@src/app");
const {
  clearUserTable,
  partialUserTableClear,
  findUserById,
  initDB,
  closeDB,
} = require("../endpointsTestHelpers");

const authTestHelper = require("@src/__tests__/int/authTestHelper");
const { API, USERS_ENDPOINT } = require("@src/__tests__/int/apiRequests/userApiRequests");


describe(`PUT ${USERS_ENDPOINT}:id`, () => {
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

  test("should correctly update user (username,password,avatar)", async () => {
    // have to create another user for this tests
    const secondUser = await authTestHelper.createUserWithToken({
      username: "fancybackup",
      email: "updatetest@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });

    // updating user fields
    const updateRes = await API.updateUser(secondUser.id, secondUser.token, {
      // fields that should be updated (email is not allowed)
      username: "updatedUser",
      avatar: "avatarmeme.jpg",
      password: "pass12345",
      repeatPassword: "pass12345",
    });

    // to make sure, it was really updated in DB
    const updatedUser = await findUserById(secondUser.id);

    // uncomment to see error message just in case
    //console.log(updateRes.text);
    expect(updateRes.status).toBe(200); // initial response on update
    expect(updatedUser.username).toEqual("updatedUser");
    expect(updatedUser.avatar).toEqual("avatarmeme.jpg");
  });

  test("should throw an error if trying to change email", async () => {
    // have to create another user for this tests
    const secondUser = await authTestHelper.createUserWithToken({
      username: "fancybackup",
      email: "updatetest@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });

    // updating user fields
    const updateRes = await API.updateUser(secondUser.id, secondUser.token, {
      // fields that should be updated (email is not allowed)
      username: "updatedUser",
      avatar: "avatarmeme.jpg",
      email: "anyemail@mail.com",
      password: "pass12345",
      repeatPassword: "pass12345",
    });

    expect(updateRes.status).toBe(400);
    expect(updateRes.text).toContain(`"email" is not allowed`);
  });

  test("should return 404 if non-existing user", async () => {
    const userId = 9999999999;
    const res = await API.updateUser(userId, AUTHORIZED_USER.token, {
      // fields that should be updated (email is not allowed)
      username: "updatedUser",
      avatar: "avatarmeme.jpg",
      password: "pass12345",
      repeatPassword: "pass12345",
    });

    expect(res.status).toBe(404);
    expect(res.text).toContain("User is not found");
  });

  test("Should fail authentication with invalid token", async () => {
    const forgedToken = "a" + AUTHORIZED_USER.token.slice(1);

    const res = await API.updateUser(AUTHORIZED_USER.id, forgedToken, {
      username: "wontupdate",
    });

    expect(res.status).toBe(400);
    expect(res.text).toContain("invalid token");
  });
});
