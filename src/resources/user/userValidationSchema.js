"use strict";

const Joi = require("joi");

const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
// /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+={}|:;'",.<>?`~\-]).{8,30}$/; more secure but I dont need it
const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+={}|:;'",.<>?`~\-]{3,30}$/; 

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
  password: Joi.string().pattern(passwordRegex).required(),
});

const baseUserSchema = Joi.object({
  username: Joi.string().pattern(usernameRegex),
  password: Joi.string().pattern(passwordRegex),
  repeatPassword: Joi.ref("password"),
  avatar: Joi.string().optional(),
});

const createUserSchema = baseUserSchema
  .fork(["username", "password"], (field) => field.required())
  .keys({
    email: Joi.string().email().required(),
  })
  .with("password", "repeatPassword");

const updateUserSchema = baseUserSchema
  .fork(["username", "password"], (field) => field.optional())
  .keys() // unnecessary but I want to keep it :)
  .with("password", "repeatPassword");

module.exports = {
  querySchema,
  validateIdSchema,
  loginSchema,
  createUserSchema,
  updateUserSchema,
};

/* 
  Notes for myself just in case

  Joi.object({}).with("field1", "field2") Requires the presence of other keys whenever the specified key is present.

  for editing existing fields -> fork()

  for adding additional rules -> keys({field.string()})
*/
