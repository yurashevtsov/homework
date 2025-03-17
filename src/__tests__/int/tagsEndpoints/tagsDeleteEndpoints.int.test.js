const {
  API,
  TAGS_ENDPOINT,
} = require("@src/__tests__/int/apiRequests/tagApiRequest");
const authTestHelper = require("@src/__tests__/int/authTestHelper");

const {
  initDB,
  closeDB,
  clearUserTable,
  clearTagTable,
  createTags,
} = require("@src/__tests__/int/endpointsTestHelpers");

describe(`DELETE tags endpoints`, () => {
  let AUTHORIZED_USER;

  beforeAll(async () => {
    await initDB();

    AUTHORIZED_USER = await authTestHelper.createUserWithToken({
      username: "tagDelete",
      email: "tagDelete@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });
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

      const deleteRes = await API.deletetag(
        createdTag.id,
        AUTHORIZED_USER.token
      );

      expect(deleteRes.status).toBe(204);
    });

    test("should throw an error if post doesnt exists 404", async () => {
      const tagId = 999999999;

      const deleteRes = await API.deletetag(tagId, AUTHORIZED_USER.token);
      // console.log(deleteRes.text);
      expect(deleteRes.status).toBe(404);
      expect(deleteRes.text).toContain(`Tag with id ${tagId} not found`); //Tag with id 99999999 not found
    });

    test("should throw an error on invalid tag id", async () => {
      const invalidTagId = "asd";

      const deleteRes = await API.deletetag(
        invalidTagId,
        AUTHORIZED_USER.token
      );

      // console.log(deleteRes.text);
      expect(deleteRes.status).toBe(400);
      expect(deleteRes.text).toContain('"id" must be a number');
    });
  });
});
