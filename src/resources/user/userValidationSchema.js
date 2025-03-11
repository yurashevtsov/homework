"use strict";

const Joi = require("joi");

const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
// /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+={}|:;'",.<>?`~\-]).{8,30}$/; more secure but I dont need it
const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+={}:;"'<>,.?~`-]{3,20}$/;

const querySchema = Joi.object({
  order: Joi.string()
    .pattern(/^[a-zA-Z0-9]+(_(asc|desc))?$/i)
    .optional()
    .messages({
      "string.pattern.base": `order must be a string, sort direction should be specified after an underscore "id_desc"`,
    }),
  page: Joi.number().integer().positive().default(1).optional(),
  limit: Joi.number().integer().positive().max(1000).default(100).optional(),
  fields: Joi.string().optional(),
});

const validateIdSchema = Joi.object({
  id: Joi.number().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Password contains forbidden characters or does not meet the length requirement",
  }),
});

const baseUserSchema = Joi.object({
  username: Joi.string().pattern(usernameRegex).messages({
    "string.pattern.base":
      "Username contains forbidden characters or does not meet the length requirement",
  }),
  password: Joi.string().pattern(passwordRegex).messages({
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
    email: Joi.string().email().required(),
  })
  .with("password", "repeatPassword");

const updateUserSchema = baseUserSchema
  .fork(["username"], (field) => field.optional())
  .with("password", "repeatPassword")
  .or("username", "password", "avatar"); // at least 1 must be present

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
