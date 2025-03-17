const {
  initDB,
  closeDB,
  clearUserTable,
  findUserById,
  createUser,
} = require("../endpointsTestHelpers");

const { API, SIGNUP_ENDPOINT } = require("@src/__tests__/int/apiRequests");

const NEW_USER_DATA = {
  username: "signupUser",
  email: "signupemail@mail.com",
  password: "pass1234",
  repeatPassword: "pass1234",
};

describe(`SIGNUP ENDPOINT \nPOST ${SIGNUP_ENDPOINT}`, () => {
  beforeAll(async () => {
    await initDB();
  });

  beforeEach(async () => {
    await clearUserTable(); // clear table before doing a test
  });

  afterAll(async () => {
    // clear Users table
    await clearUserTable();
    await closeDB();
  });

  test("should create a new user", async () => {
    // signing up
    const res = await API.signup(NEW_USER_DATA);

    // making sure user exists in the db
    const createdUser = await findUserById(res.body.user.id);

    expect(res.status).toBe(201);
    expect(res.body.user.username).toBeDefined();
    expect(res.body.user.email).toBeDefined();
    expect(res.body.user).not.toHaveProperty("password");
    expect(res.body).toHaveProperty("token");
    // making sure that user was created in db
    expect(createdUser).toHaveProperty("id");
    expect(createdUser.username).toBe(NEW_USER_DATA.username);
    expect(createdUser.email).toBe(NEW_USER_DATA.email);
  });

  test("Should not create a duplicate", async () => {
    // creating user
    await createUser(NEW_USER_DATA);
    // repeating request to try to create duplicate
    const res = await API.signup(NEW_USER_DATA);

    expect(res.status).toBe(400);
    expect(res.text).toContain(`username must be unique`);
  });

  const invalidInputTests = [
    {
      description: "Should throw an error on invalid input(username)",
      invalidData: {
        username: "@lary",
        email: "test@mail.com",
        password: "pass1234",
        repeatPassword: "pass1234",
      },
      expectedMessage:
        "Username contains forbidden characters or does not meet the length requirement",
    },
    {
      description: "Should throw an error on invalid input(password)",
      invalidData: {
        username: "lary",
        email: "test@mail.com",
        password: "pass1234 --",
        repeatPassword: "pass1234 --",
      },
      expectedMessage:
        "Password contains forbidden characters or does not meet the length requirement",
    },
    {
      description: "Should throw an error if passwords do not match",
      invalidData: {
        username: "lary",
        email: "test@mail.com",
        password: "pass12345",
        repeatPassword: "savage12345",
      },
      expectedMessage: "Passwords do not match",
    },
  ];

  invalidInputTests.forEach(
    async ({ description, invalidData, expectedMessage }, index) => {
      test(description, async () => {
        const res = await API.signup(invalidData);

        if (res.status !== 400 || !res.text.includes(expectedMessage)) {
          throw new Error(
            `Error in test case ${
              index + 1
            }. \nExpected "${expectedMessage}" but recieved ${res.text}`
          );
        }

        expect(res.status).toBe(400);
        expect(res.text).toContain(expectedMessage);
      });
    }
  );
});
