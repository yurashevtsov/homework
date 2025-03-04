const AppFeatures = require("./appFeatures");
// validating is done by Joi, so not really concerned with errors and validation
// const querySchema = Joi.object({
//   order: Joi.string()
//     .pattern(/^[a-zA-Z0-9]+(_(asc|desc))?$/i)
//     .optional(),
//   page: Joi.number().integer().positive().default(1),
//   limit: Joi.number().integer().max(1000).default(100),
//   fields: Joi.string(),
// });

describe(".AppFeatures", () => {
  let dbQuery;
  let qParams;
  const defaultPage = 1;
  const defaultLimit = 100;

  beforeEach(() => {
    dbQuery = {};
    qParams = {};
  });

  describe("#sort", () => {
    test("converts 'order' string to an array", () => {
      const orderStr = "id_asc, createdAt_desc, avatar";
      const expectedOutcome = [
        ["id", "asc"],
        ["createdAt", "desc"],
        ["avatar"],
      ];
      // setting order
      qParams.order = orderStr;

      const { databaseQuery } = new AppFeatures(dbQuery, qParams);

      expect(databaseQuery.order).toEqual(expectedOutcome);
    });

    test("shouldn't create 'order' property if it doesn't exists", () => {
      const { databaseQuery } = new AppFeatures(dbQuery, qParams);
      expect(databaseQuery.order).toBeUndefined();
    });
  });

  describe("#paginate", () => {
    test("correctly sets 'page' property if present", () => {
      const curPage = 10;
      qParams.page = curPage;

      const { databaseQuery } = new AppFeatures(dbQuery, qParams);

      expect(databaseQuery.page).toEqual(curPage);
    });

    test("sets default page to 1 if not present", () => {
      const { databaseQuery } = new AppFeatures(dbQuery, qParams);
      expect(databaseQuery.page).toEqual(1);
    });

    test("correctly sets a 'limit' property", () => {
      const setLimit = 200;
      qParams.limit = setLimit;

      const { databaseQuery } = new AppFeatures(dbQuery, qParams);
      expect(databaseQuery.limit).toEqual(setLimit);
    });

    test("default limit is set to 100", () => {
      const { databaseQuery } = new AppFeatures(dbQuery, qParams);
      expect(databaseQuery.limit).toEqual(100);
    });

    test("correctly sets 'offset' property", () => {
      const page = 10;
      const limit = 10;
      const expectedOffset = (page - 1) * limit;

      qParams.page = 10;
      qParams.limit = 10;

      const { databaseQuery } = new AppFeatures(dbQuery, qParams);

      expect(databaseQuery.page).toEqual(page);
      expect(databaseQuery.limit).toEqual(limit);
      expect(databaseQuery.offset).toEqual(expectedOffset);
    });

    test("default offset is 0", () => {
      const expectedOffset = 0;
      const { databaseQuery } = new AppFeatures(dbQuery, qParams);
      expect(databaseQuery.offset).toEqual(expectedOffset);
    });

    test("Testing all default values - page, limit, offset", () => {
      const expectedOffset = 0;
      const { databaseQuery } = new AppFeatures(dbQuery, qParams);

      expect(databaseQuery.page).toEqual(defaultPage);
      expect(databaseQuery.limit).toEqual(defaultLimit);
      expect(databaseQuery.offset).toEqual(expectedOffset);
    });
  });

  describe("#limitFields", () => {
    test("sets 'attributes' property correctly", () => {
      const fieldInput = "avatar, name";
      const expectedAttributes = ["avatar", "name"];

      qParams.fields = fieldInput;

      const { databaseQuery } = new AppFeatures(dbQuery, qParams);

      expect(databaseQuery.attributes).toEqual(expectedAttributes);
    });
  });
});
