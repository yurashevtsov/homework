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
    throw new HttpNotFoundError(`Tag with id ${id} not found`);
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
    throw new HttpNotFoundError(`Tag with id ${id} not found`);
  }

  foundTag.set(tagData);

  return foundTag.save();
}

async function deleteTagById(id) {
  const tagToDelete = await Tag.findOne({
    where: { id },
  });

  if (!tagToDelete) {
    throw new HttpNotFoundError(`Tag with id ${id} not found`);
  }

  await tagToDelete.destroy();

  return null;
}

/**
 * Find or creates tags
 * @param {string[]} tagNamesArr an array of tag names ["meme", "sports" "politics"]
 * @returns {object[]}  array containing tags of created/found tags
 */
async function findOrCreateTags(tagNamesArr, transaction) {
  //removing dublicates just in case
  tagNamesArr = [...new Set(tagNamesArr)];
  // Getting existing tags
  const fetchedTags = await Tag.findAll({
    where: {
      name: { [Op.in]: tagNamesArr },
    },
  });
  // an array with existing tag names
  const fetchedTagNames = fetchedTags.map((tag) => tag.name);
  // creates an array of objects with tag names that should be created
  const tagsToCreate = tagNamesArr
    .filter((tagName) => !fetchedTagNames.includes(tagName))
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
