"use strict";

const catchASync = require("@src/utils/catchAsync.js");
const tagService = require("@src/resources/tag/tagService.js");

async function getAllTags(req, res) {
  const allTags = await tagService.getAllTags();

  res.status(200).send(allTags);
}

async function getOneTag(req, res) {
  const tagId = req.params.id;

  res.status(200).send(await tagService.getTagById(tagId));
}

async function createTag(req, res) {
  const tagData = req.body;

  res.status(200).send(await tagService.createTag(tagData));
}

async function updateTag(req, res) {
  const tagId = req.params.id;
  const tagData = req.body;

  res.status(200).send(await tagService.updateTagById(tagId, tagData));
}

async function deleteTag(req, res) {
  const tagId = req.params.id;

  res.status(200).send(await tagService.deleteTagById(tagId));
}

module.exports = {
  getAllTags: catchASync(getAllTags),
  getOneTag: catchASync(getOneTag),
  createTag: catchASync(createTag),
  updateTag: catchASync(updateTag),
  deleteTag: catchASync(deleteTag),
};
