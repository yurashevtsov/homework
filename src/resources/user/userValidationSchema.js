"use strict";

const Joi = require("joi");

// const helpers = require("@src/utils/helpers"); // if i'm planning to use previously defined schema

const querySchema = Joi.object({
  order: Joi.string()
    .pattern(/^[a-zA-Z0-9]+(_(asc|desc))?$/i)
    .optional(),
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(1000).default(100),
  fields: Joi.string(),
});

const validateIdSchema = Joi.object({
  id: Joi.number().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

// with("field1", "field2") Requires the presence of other keys whenever the specified key is present.
const createUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  repeatPassword: Joi.ref("password"),
  avatar: Joi.string().optional(),
}).with("password", "repeatPassword");

const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional(),
  avatar: Joi.string().optional(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).optional(),
  repeatPassword: Joi.ref("password"),
}).with("password", "repeatPassword");

module.exports = {
  querySchema,
  validateIdSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
};

// const querySchema = Joi.object({
//   // lets just keep it simple - only allowing strings and convert them to an array of strings - for sequelize ->  attributes:["field1", "field2"]
//   fields: Joi.string().custom(helpers.convertStringToArray).optional(),
//   page: Joi.number().default(1),
//   limit: Joi.number().min(1).max(1000).default(100),
//   // sortDirection: Joi.string().default("asc"), why I commented it out? I want to provide sort direction in order by an underscore, if its not specified, SQLIZE will do ASC, otherwise _desc should be specified by user
//   order: Joi.alternatives().try(
//     Joi.array().items(Joi.string()),
//     Joi.string().custom(helpers.convertStringToArray)
//   ),
// });
