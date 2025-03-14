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
    await clearTagTable();
    await clearUserTable();
    await closeDB();
  });

  describe(`DELETE ${TAGS_ENDPOINT}:id`, () => {
    test("should delete tag by id", async () => {
      // create tag
      const [createdTag] = await createTags("deleteme");
      // request to delete tag by id
      expect(createdTag).toHaveProperty("id");

      const deleteRes = await request(app)
        .delete(`${TAGS_ENDPOINT}${createdTag.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(204);
    });

    test("should throw an error if post doesnt exists 404", async () => {
      const tagId = 999999999;

      const deleteRes = await request(app)
        .delete(`${TAGS_ENDPOINT}${tagId}`)
        .set("Authorization", `Bearer ${authToken}`);
      // console.log(deleteRes.text);
      expect(deleteRes.status).toBe(404);
      expect(deleteRes.text).toContain(`Tag with id ${tagId} not found`); //Tag with id 99999999 not found
    });

    test("should throw an error on invalid tag id", async () => {
      const invalidTagId = "asd";

      const deleteRes = await request(app)
        .delete(`${TAGS_ENDPOINT}${invalidTagId}`)
        .set("Authorization", `Bearer ${authToken}`);

      // console.log(deleteRes.text);
      expect(deleteRes.status).toBe(400);
      expect(deleteRes.text).toContain('"id" must be a number');
    });
  });
});
