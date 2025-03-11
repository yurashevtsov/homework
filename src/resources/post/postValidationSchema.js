"use strict";

const Joi = require("joi");
const helpers = require("@src/utils/helpers");

const validateIdSchema = Joi.object({
  id: Joi.number().positive().required(),
});

const postCreateSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()).min(1),
      Joi.string().custom(helpers.convertStringToArray)
    )
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
