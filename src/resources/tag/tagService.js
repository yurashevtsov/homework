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
  const tagToDelete = await Tag.findOne({
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
async function findOrCreateTags(tagNamesArr, transaction) {
  if (typeof tagNamesArr === "string") {
    tagNamesArr = tagNamesArr.split(",").map((t) => t.trim());
  }

  tagNamesArr = [...new Set(tagNamesArr)]; // in case of dublicates

  // Getting existing tags
  const fetchedTags = await Tag.findAll({
    where: {
      name: { [Op.in]: tagNamesArr },
    },
  });

  const existingTagNamesSet = new Set(
    fetchedTags.map((tag) => tag.name.trim())
  );
  const tagsToCreate = tagNamesArr
    .filter((tagName) => !existingTagNamesSet.has(tagName))
    .map((tagName) => ({ name: tagName }));

  if (tagsToCreate.length > 0) {
    const createdTags = await Tag.bulkCreate(tagsToCreate, {
      validate: true,
      transaction,
    });
    return [...fetchedTags, ...createdTags];
  }

  return fetchedTags; // Если все теги уже существуют
}

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTagById,
  deleteTagById,
  findOrCreateTags,
};
