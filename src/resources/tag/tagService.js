"use strict";

const { Tag } = require("@src/associations/models/index.js");
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

module.exports = {
  getAllTags,
  getTagById,
  createTag,
  updateTagById,
  deleteTagById,
};
