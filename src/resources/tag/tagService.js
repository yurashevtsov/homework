"use strict";

const { Tag } = require("@src/associations/models/index.js");
const { Op } = require("sequelize");
const { HttpNotFoundError } = require("@src/utils/httpErrors");

async function getAllTags() {
  return await Tag.findAll();
}

async function getTagById(id) {
  const foundTag = await Tag.findOne({
    where: { id },
  });

  if (!foundTag) {
    throw new HttpNotFoundError("Tag with that id is not found");
  }

  return foundTag;
}

async function createTag(tagData) {
  const newTag = await Tag.create(tagData);

  return newTag;
}

async function updateTagById(id, tagData) {
  const foundTag = await Tag.findOne({
    where: { id },
  });

  if (!foundTag) {
    throw new HttpNotFoundError(`Tag with that id is not found.`);
  }

  // planning only to update name but w/e
  foundTag.set(tagData);

  await foundTag.save();

  return foundTag;
}

async function deleteTagById(id) {
  const tagToDelete = await Tag.destroy({
    where: { id },
  });

  if (!tagToDelete) {
    throw new HttpNotFoundError(`Tag with that id is not found.`);
  }

  await tagToDelete.destroy();

  return null;
}

/**
 * Find or creates tags
 * @param {string[]} tagNamesArr an array of tag names ["meme", "sports" "politics"]
 * @returns {object}  object containing all tags
 */
async function findOrCreateTags(tagNamesArr) {
  // just in case its a string with names
  if (typeof tagNamesArr === "string") {
    tagNamesArr = tagNamesArr.split(",").map((t) => t.trim());
  }

  //1. figure out which tags I already have
  // fetching already existing tags from the database
  const fetchedTags = await Tag.findAll({
    where: {
      name: { [Op.in]: tagNamesArr },
    },
  });

  // if tags fetched less than requested, I need to create tags that I dont have
  if (fetchedTags.length < tagNamesArr.length) {
    const exitingTagsNames = fetchedTags
      .map((tag) => tag.name.trim())
      .join(",");

    // 2. figure out which tags I dont have yet (with array filter)
    const tagsToCreate = tagNamesArr
      .filter((tagName) => !exitingTagsNames.includes(tagName))
      .map((tagName) => ({ name: tagName }));

    //3. then use bulk create on whatever I dont have yet
    const createdTags = await Tag.bulkCreate(tagsToCreate, { validate: true });

    //4. join 2 arrays - arrays of existing tags and newly created tags
    return [...createdTags, ...fetchedTags];
  } else {
    // IF all tags were existing then return fetched tags
    return fetchedTags;
  }
}

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTagById,
  deleteTagById,
  findOrCreateTags,
};
