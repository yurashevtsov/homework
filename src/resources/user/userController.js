"use strict";

const catchAsync = require("@src/utils/catchAsync.js");
const userService = require("./userService.js");

async function signup(req, res) {
  // allowed fields: username, email, password, avatar - handled by Joi middleware
  const data = await userService.userSignup(req.body);

  res.status(201).send(data);
}

async function login(req, res) {
  const data = await userService.authenticateUser(
    req.body.email,
    req.body.password
  );

  res.status(200).send(data);
}

async function getAllUsers(req, res) {
  const query = req.query;

  res.status(200).send(await userService.getAllUsers(query));
}

async function getOneUser(req, res) {
  const userId = req.params.id;

  res.status(200).send(await userService.getUserById(userId));
}

async function createUser(req, res) {
  const userId = req.params.id;

  res.status(201).send(await userService.createUser(userId));
}

// changing email is not allowed
async function updateUser(req, res) {
  const userId = req.params.id;
  const userData = req.body;

  res.status(200).send(await userService.updateUser(userId, userData));
}

async function deleteUser(req, res) {
  const userId = req.params.id;

  res.status(204).send(await userService.deleteUserById(userId));
}

module.exports = {
  signup: catchAsync(signup),
  login: catchAsync(login),
  getAllUsers: catchAsync(getAllUsers),
  getOneUser: catchAsync(getOneUser),
  createUser: catchAsync(createUser),
  updateUser: catchAsync(updateUser),
  deleteUser: catchAsync(deleteUser),
};
