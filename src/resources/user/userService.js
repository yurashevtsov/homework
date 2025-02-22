"use strict";

// const { User } = require("@src/associations/models/index.js");
const { User } = require("@src/database/models/sequelize_db").sequelize.models;
const passwordService = require("@src/auth/passwordService.js");
const jwtService = require("@src/auth/jwtService.js");
const AppFeatures = require("@src/utils/appFeatures.js");
const {
  HttpNotFoundError,
  HttpBadRequestError,
} = require("@src/utils/httpErrors");

/**
 * Authenticate user by email and password
 * @param {string} email user email
 * @param {string} candidatePassword user password
 * @returns {Object} Object with 2 properties: user, token
 */
async function authenticateUser(email, candidatePassword) {
  //1. get the user details(with password)
  const foundUser = await getUserByEmailWithPassword(email);

  if (!foundUser) {
    throw new HttpBadRequestError("Invalid credentials.");
  }

  // 2.make sure passwords matches the password from database
  const isCorrectPassword = await passwordService.isValidPassword(
    candidatePassword,
    foundUser.password
  );

  // 3. if passwords are not equal then send a vague message - no leaking
  if (!isCorrectPassword) {
    throw new HttpBadRequestError("Invalid credentials");
  }
  // 4.sign token
  const token = jwtService.encodeToken(foundUser.id);

  return {
    user: foundUser,
    token,
  };
}

/** accepts user data to create a new user - username, email, password, (repeatPassword), avatar (optional)
 * @param {Object} userData typically, user.body (validated by joi)
 * @returns {Object} Returns object with 2 properties - user, token
 */
async function userSignup(userData) {
  const newUser = await createUser(userData);
  const token = jwtService.encodeToken(newUser.id);

  return {
    user: newUser,
    token,
  };
}

async function getAllUsers(queryParams) {
  const { databaseQuery } = new AppFeatures({}, queryParams);

  return await User.findAll(databaseQuery);
}

async function getUserById(id) {
  const user = await User.findOne({
    where: { id },
  });

  if (!user) {
    throw new HttpNotFoundError(`User is not found.`);
  }

  return user;
}

// for JWT validation, so JWT handler would throw an error
async function getUserByIdNoError(id) {
  const user = await User.findOne({
    where: { id },
  });

  return user;
}

// we dont want to leak any information about the user, no error handlers here
async function getUserByEmailWithPassword(email) {
  const user = await User.scope("withPassword").findOne({
    where: { email },
  });

  return user;
}

/** accepts user data to create a new user - username, email, password, (repeatPassword), avatar (optional)
 * @param {Object} userData typically, user.body (validated by joi)
 * @returns {Object} A new user object
 */
async function createUser(userData) {
  const newUser = await User.create(userData);

  return newUser;
}

async function updateUser(userId, userData) {
  const foundUser = await User.findOne({
    where: { id: userId },
  });

  if (!foundUser) {
    throw new HttpNotFoundError(`User is not found.`);
  }

  foundUser.set(userData);

  // funny enough, if I have {fields: "password"} and wont provide this password field, I will get an error, LOL. Sadness
  await foundUser.save();

  return foundUser;
}

async function deleteUserById(id) {
  const foundUser = await getUserById(id);

  // not throwing error if not found because other function would do it
  await foundUser.destroy();

  return null;
}

module.exports = {
  authenticateUser,
  userSignup,
  getUserByEmailWithPassword,
  getAllUsers,
  createUser,
  getUserById,
  getUserByIdNoError,
  updateUser,
  deleteUserById,
};
