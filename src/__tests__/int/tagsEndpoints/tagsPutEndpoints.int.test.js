const request = require("supertest");
const app = require("@src/app");

const TAGS_ENDPOINT = "/api/homework/tags/";
const SIGNUP_ENDPOINT = "/api/homework/users/signup";

const {
  initDB,
  closeDB,
  clearUserTable,
  clearTagTable,
  createTags,
} = require("@src/__tests__/int/endpointsTestHelpers");

describe(`GET tags endpoints`, () => {
  let auhtorizedUser;
  let authToken;

  beforeAll(async () => {
    await initDB();

    const signupRes = await request(app).post(SIGNUP_ENDPOINT).send({
      username: "postUser",
      email: "postuser@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });

    auhtorizedUser = signupRes.body.user;
    authToken = signupRes.body.token;
  });

  afterEach(async () => {
    await clearTagTable();
  });

  afterAll(async () => {
    await Promise.all([clearUserTable(), clearTagTable()]);
    await closeDB();
  });

  describe(`PUT ${TAGS_ENDPOINT}:id`, () => {
    test("should update tag by id", async () => {
      const updatedTagName = { name: "updated name" };
      const expectedTagName = "updated name";
      // create tag
      const [createdTag] = await createTags("news");

      expect(createdTag).toHaveProperty("id");
      expect(createdTag.name).toBe("news");
      // update tag
      const updateRes = await request(app)
        .put(`${TAGS_ENDPOINT}${createdTag.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedTagName);

      console.log(updateRes.text);
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.name).toBe(expectedTagName);
    });

    test("should throw an error if tag isnt found 404", async () => {
      const tagId = 9999999;
      const updatedTagName = { name: "updated name" };

      const updateRes = await request(app)
        .put(`${TAGS_ENDPOINT}${tagId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedTagName);

      expect(updateRes.status).toBe(404);
      expect(updateRes.text).toContain("not found");
    });

    test("should throw an error on inval tag id", async () => {
      const tagId = "asd";
      const updatedTagName = { name: "updated name" };

      const updateRes = await request(app)
        .put(`${TAGS_ENDPOINT}${tagId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updatedTagName);

      // console.log(updateRes.text);
      expect(updateRes.status).toBe(400);
      expect(updateRes.text).toContain('"id" must be a number');
    });
  });
});
