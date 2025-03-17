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

describe(`GET tags endpoints`, () => {
  let AUTHORIZED_USER;

  beforeAll(async () => {
    await initDB();

    AUTHORIZED_USER = await authTestHelper.createUserWithToken({
      username: "getTagEndpoint",
      email: "getTagEndpoint@mail.com",
      password: "pass1234",
      repeatPassword: "pass1234",
    });
  });

  afterEach(async () => {
    await clearTagTable();
  });

  afterAll(async () => {
    await clearUserTable();
    await clearTagTable();
    await closeDB();
  });

  describe(`GET ${TAGS_ENDPOINT}`, () => {
    test("should get all existing tags", async () => {
      // create 2 tags
      let [tag1, tag2] = await createTags("gw1, gw2");

      const res = await API.getAllTags(AUTHORIZED_USER.token);

      tag1 = tag1.toJSON();
      tag2 = tag2.toJSON();

      // console.log(res.text);
      expect(res.status).toBe(200);
      expect(res.body[0]).toEqual(tag1);
      expect(res.body[1]).toEqual(tag2);
      expect(res.body).toHaveLength(2);
    });
  });

  describe(`GET ${TAGS_ENDPOINT}:id`, () => {
    test("should get one tag by id", async () => {
      // create 2 tags
      let [tag1, tag2] = await createTags("gw1, gw2");

      const res = await API.getOneTag(tag1.id, AUTHORIZED_USER.token);

      // console.log(res.text);
      expect(res.status).toBe(200);
      expect(res.body.name).toEqual(tag1.name);
    });
  });

  test("should throw an error if tag doesnt exists 404", async () => {
    const tagId = 9999999;
    // create 2 tags
    await createTags("gw1, gw2");

    const res = await API.getOneTag(tagId, AUTHORIZED_USER.token);

    // console.log(res.text);
    expect(res.status).toBe(404);
    expect(res.text).toContain(`Tag with id ${tagId} not found`); // Tag with id 99999999 not found
  });

  test("should throw an error on invalid tag id", async () => {
    const invalidTagId = "asdf";

    const res = await API.getOneTag(invalidTagId, AUTHORIZED_USER.token);

    // console.log(res.text);
    expect(res.status).toBe(400);
    expect(res.text).toContain('"id" must be a number'); // Tag with id 99999999 not found
  });
});
