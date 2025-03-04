"use strict";

const Joi = require("joi");
const helpers = require("@src/utils/helpers");

const validateIdSchema = Joi.object({
  id: Joi.number().required(),
});

const postCreateSchema = Joi.object({
  title: Joi.string().optional(),
  content: Joi.string().optional(),
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()),
      Joi.string().custom(helpers.convertStringToArray)
    )
    .required(), // at least 1 tag
});

module.exports = {
  validateIdSchema,
  postCreateSchema,
};
