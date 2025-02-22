"use strict";

/**
 * @type {import('sequelize').Sequelize}
 */
const sequelizeInstance =
  require("@src/database/models/sequelize_db").sequelize;
const { Tag } = sequelizeInstance.models;
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
 * @returns {number[]}  array containing tags of created/found id
 */
async function findOrCreateTags(tagNamesArr, transaction) {
  // Getting existing tags
  const fetchedTags = await Tag.findAll({
    where: {
      name: { [Op.in]: tagNamesArr },
    },
  });
  // an array with existing tag names
  const existingTagNames = fetchedTags.map((tag) => tag.name.trim());
  // creates an array of objects with tag names that should be created
  const tagsToCreate = tagNamesArr
    .filter((tagName) => !existingTagNames.includes(tagName))
    .map((tagName) => ({ name: tagName }));
  // if tagsToCreate is empty, all tags were already found
  if (tagsToCreate.length > 0) {
    const createdTags = await Tag.bulkCreate(tagsToCreate, {
      validate: true,
      transaction,
    });
    return [...fetchedTags, ...createdTags];
  }

  return fetchedTags; // if tags already exists
}

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTagById,
  deleteTagById,
  findOrCreateTags,
};
