const { findOrCreateTags } = require("@src/resources/tag/tagService");
const { Tag } = require("@src/database/models/sequelize_db").sequelize.models;
const { Op } = require("sequelize");

jest.mock("@src/database/models/sequelize_db", () => ({
  sequelize: {
    models: {
      Tag: {
        findAll: jest.fn(),
        bulkCreate: jest.fn(),
      },
    },
  },
}));

describe("#findOrCreateTags part of a tag service to find or create tags", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should find existing tags and create new ones", async () => {
    const tagsToFindOrCreate = ["gw1", "gw2", "gw3"]; // initial input
    const foundTags = [{ name: "gw1" }]; // tags that was found in db
    const createdTags = [{ name: "gw2" }, { name: "gw3" }]; // tags that should be created
    const expectedResult = [...foundTags, ...createdTags];

    Tag.findAll.mockResolvedValue(foundTags);
    Tag.bulkCreate.mockResolvedValue(createdTags);

    const result = await findOrCreateTags(tagsToFindOrCreate, "transaction");

    expect(Tag.findAll).toHaveBeenCalledWith({
      where: {
        name: { [Op.in]: tagsToFindOrCreate },
      },
    });

    expect(Tag.bulkCreate).toHaveBeenCalledWith(createdTags, {
      validate: true,
      transaction: expect.anything(),
    });

    expect(result).toEqual(expectedResult);
  });

  test("should create tags that do not exist", async () => {
    const tagsToFindOrCreate = ["gw2", "gw3"];
    const foundTags = [];
    const createdTags = [{ name: "gw2" }, { name: "gw3" }];
    const expectedResult = [...foundTags, ...createdTags];

    Tag.findAll.mockResolvedValue(foundTags);
    Tag.bulkCreate.mockResolvedValue(createdTags);

    const result = await findOrCreateTags(tagsToFindOrCreate, "transaction");

    expect(Tag.findAll).toHaveBeenCalledWith({
      where: {
        name: { [Op.in]: tagsToFindOrCreate },
      },
    });

    expect(Tag.bulkCreate).toHaveBeenCalledWith(createdTags, {
      validate: true,
      transaction: expect.anything(),
    });

    expect(result).toEqual(expectedResult);
  });

  test("should not create tags that already exist", async () => {
    const tagsToFindOrCreate = ["gw2", "gw3"];
    const foundTags = [{ name: "gw2" }, { name: "gw3" }]; // Здесь удостоверяемся, что теги уже существуют.
    const createdTags = []; // shouldnt be created any tags, nor called bulkCreate
    const expectedResult = foundTags;

    Tag.findAll.mockResolvedValue(foundTags);
    Tag.bulkCreate.mockResolvedValue(createdTags);

    const result = await findOrCreateTags(tagsToFindOrCreate, "transaction");

    expect(Tag.findAll).toHaveBeenCalledWith({
      where: {
        name: { [Op.in]: tagsToFindOrCreate },
      },
    });

    expect(Tag.bulkCreate).not.toHaveBeenCalled(); // shouldnt be called

    expect(result).toEqual(expectedResult);
  });
});
