"use strict";

const Joi = require("joi");

const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
// /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+={}|:;'",.<>?`~\-]).{8,30}$/; more secure but I dont need it
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+={}:;"'<>,.?~`-]{3,20}$/;

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
  username: Joi.string().pattern(usernameRegex).messages({
    "string.base": "Username must be a string",
    "string.empty": "Username cannot be empty",
    "string.pattern.base":
      "Input contains forbidden characters or does not meet the length requirement",
    "string.min": "Username must be at least 3 characters long",
    "string.max": "Username must be at most 20 characters long",
  }),
  password: Joi.string().pattern(passwordRegex).messages({
    "string.base": "Password must be a string",
    "string.empty": "Password cannot be empty",
    "string.pattern.base":
      "Password contains forbidden characters or does not meet the length requirement",
  }),
  repeatPassword: Joi.string().valid(Joi.ref("password")).messages({
    "any.only": "Passwords do not match",
  }),
  avatar: Joi.string().optional(),
});

const createUserSchema = baseUserSchema
  .fork(["username", "password", "repeatPassword"], (field) => field.required())
  .keys({
    email: Joi.string().email().required().messages({
      "string.base": "Email must be a string",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address",
    }),
  })
  .with("password", "repeatPassword");

const updateUserSchema = baseUserSchema
  .fork(["username"], (field) => field.optional())
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

  // stupid update validator xD
  // .custom((value, helpers) => {
  //   // check if password exists
  //   if (value.password) {
  //     if (!value.repeatPassword) {
  //       return helpers.error("repeatPassword is missing");
  //     }
  //     // mismatch
  //     if (value.repeatPassword !== value.password) {
  //       return helpers.error("repeatPassword is not equal to password");
  //     }
  //   }

  //   return value; // if password exists and its equal to repeatPassword
  // })
*/
