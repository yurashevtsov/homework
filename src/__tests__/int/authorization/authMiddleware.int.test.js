const request = require("supertest");
const app = require("@src/app");

const { initDB, closeDB, clearUserTable } = require("../endpointsTestHelpers");
const SIGNUP_ENDPOINT = "/api/homework/users/signup";
const USERS_ENDPOINT = "/api/homework/users/";

const jwtService = require("@src/auth/jwtService");
const userService = require("@src/resources/user/userService");

jest.mock("@src/auth/jwtService");
jest.mock("@src/resources/user/userService");

describe("Authorization middleware", () => {
  beforeAll(async () => {
    await initDB();

    // const signupRes = await request(app).post(SIGNUP_ENDPOINT).send({
    //   username: "postUser",
    //   email: "postuser@mail.com",
    //   password: "pass1234",
    //   repeatPassword: "pass1234",
    // });

    // auhtorizedUser = signupRes.body.user;
    // authToken = signupRes.body.token;
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await clearUserTable();
    await closeDB();
  });

  test("return 400 if token is not provided", async () => {
    const getUsersRes = await request(app)
      .get(USERS_ENDPOINT)
      .set("Authorization", ``);

    expect(getUsersRes.status).toBe(400);
    expect(getUsersRes.text).toContain("Invalid token or it doesnt exists");
  });

  test("should return 400 if token does not have AUTHENTICATION scope", async () => {
    const mockToken = "mock.jwt.token";
    const payload = { sub: 10, scope: "MEMES" };
    jwtService.decodeToken.mockResolvedValue(payload);

    const response = await request(app)
      .get(USERS_ENDPOINT)
      .set("Authorization", `Bearer ${mockToken}`);

    // console.log(response.text);
    expect(response.status).toBe(400);
    expect(response.text).toContain("Invalid token");
  });

  test("should return throw an error if user changed password after JWT was issued", async () => {});
});
