const request = require("supertest");
const app = require("@src/app");

const SIGNUP_ENDPOINT = "/api/homework/users/signup";
const LOGIN_ENDPOINT = "/api/homework/users/login";
const USERS_ENDPOINT = "/api/homework/users/";
const POSTS_ENDPOINT = "/api/homework/posts/";

const API = {
  /**
   * Logs in a user.
   * @param {object} userData - Object containing user credentials.
   */
  login: (userData) => {
    return request(app).post(LOGIN_ENDPOINT).send(userData);
  },

  /**
   * Signs up a new user.
   * @param {object} userData - Object containing user details for sign up.
   */
  signup: (userData) => {
    return request(app).post(SIGNUP_ENDPOINT).send(userData);
  },

  /**
   * Retrieves all users.
   * @param {string} token - The Bearer token for authorization.
   */
  getAllUsers: (token) => {
    return request(app)
      .get(USERS_ENDPOINT)
      .set("Authorization", `Bearer ${token}`);
  },

  /**
   * Fetches a single user by their ID.
   * @param {number} userId - The ID of the user to retrieve.
   * @param {string} token - The Bearer token for authorization.
   */
  getOneUser: (userId, token) => {
    return request(app)
      .get(`${USERS_ENDPOINT}${userId}`)
      .set("Authorization", `Bearer ${token}`);
  },

  /**
   * Fetches a single user by their ID.
   * @param {object} userData - User data containing fields - username, email, password, repeatPassword.
   * @param {string} token - The Bearer token for authorization.
   */
  createUser: (userData, token) => {
    return request(app)
      .post(USERS_ENDPOINT)
      .set("Authorization", `Bearer ${token}`)
      .send(userData);
  },

  /**
   * Updates the user specified by their ID.
   * @param {number} userId - The ID of the user to update.
   * @param {string} token - The Bearer token for authorization.
   * @param {object} userUpdateData - The data to update the user with.
   */
  updateUser: (userId, token, userUpdateData) => {
    return request(app)
      .put(`${USERS_ENDPOINT}${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(userUpdateData);
  },
  /**
   * Deletes the user specified by their ID.
   * @param {number} userId - The ID of the user to delete.
   * @param {string} token - The Bearer token for authorization.
   */
  deleteUser: (userId, token) => {
    return request(app)
      .delete(`${USERS_ENDPOINT}${userId}`)
      .set("Authorization", `Bearer ${token}`);
  },
};

module.exports = { API, SIGNUP_ENDPOINT, LOGIN_ENDPOINT, USERS_ENDPOINT };
