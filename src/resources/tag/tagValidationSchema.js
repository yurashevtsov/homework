const Joi = require("joi");

const validateIdSchema = Joi.object({
  id: Joi.number().positive().required(),
});

const tagCreateSchema = Joi.object({
  name: Joi.string().required(),
});

const tagUpdateSchema = Joi.object({
  name: Joi.string().required(),
});

module.exports = {
  validateIdSchema,
  tagCreateSchema,
  tagUpdateSchema,
};
