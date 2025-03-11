"use strict";

const Joi = require("joi");
const helpers = require("@src/utils/helpers");

const validateIdSchema = Joi.object({
  id: Joi.number().positive().required(),
});

const postCreateSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  tags: Joi.string()
    .custom((value, joiHelper) => {
      const arr = helpers.convertStringToArray(value);
      // remove dublicates
      return [...new Set(arr)];
    })
    .required(), // at least 1 tag
});

const postUpdateSchema = postCreateSchema
  .fork(["title", "content", "tags"], (field) => field.optional())
  .or("title", "content", "tags");

module.exports = {
  validateIdSchema,
  postCreateSchema,
  postUpdateSchema,
};
