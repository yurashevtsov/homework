const request = require("supertest");
const app = require("@src/app");

const TAGS_ENDPOINT = "/api/homework/tags/";
const authTestHelper = require("@src/__tests__/int/authTestHelper");

const {
  initDB,
  closeDB,
  clearUserTable,
  clearTagTable,
} = require("@src/__tests__/int/endpointsTestHelpers");

describe(`POST ${TAGS_ENDPOINT}`, () => {
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
    await clearTagTable();
  });

  afterAll(async () => {
    await clearTagTable();
    await clearUserTable();
    await closeDB();
  });

  test("should create a new tag", async () => {
    const tagData = { name: "newTag" }; // Данные тега для создания

    const res = await request(app)
      .post(TAGS_ENDPOINT)
      .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`)
      .send(tagData);

    // console.log(res.text);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id"); // Проверяем, что у нового тега есть id
    expect(res.body.name).toBe(tagData.name); // Проверяем, что имя тега соответствует ожидаемому
  });

  test("should throw error if name is missing", async () => {
    const tagData = {};
    const res = await request(app)
      .post(TAGS_ENDPOINT)
      .set("Authorization", `Bearer ${AUTHORIZED_USER.token}`)
      .send(tagData);

    // console.log(res.text);
    expect(res.status).toBe(400);
    expect(res.text).toContain(`"name" is required`);
  });
});
