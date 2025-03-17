const request = require("supertest");
const app = require("@src/app");

const SIGNUP_ENDPOINT = "/api/homework/users/signup";
const USERS_ENDPOINT = "/api/homework/users/";

const API = {
  getOneUser: (userId, token) => {
    return request(app)
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);
  },
  getAllUsers: (token) => {
    return request(app).get().set();
  },
  // Other request methods like postUser, updateUser, etc.
};

module.exports = API;
