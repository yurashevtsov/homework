const request = require("supertest");
const app = require("@src/app");
const POSTS_ENDPOINT = "/api/homework/posts/";

const API = {
  /**
   * Retrieves all posts.
   * @param {string} token - The Bearer token for authorization.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  getAllPosts: (token) => {
    return request(app)
      .get(POSTS_ENDPOINT)
      .set("Authorization", `Bearer ${token}`);
  },

  /**
   * Retrieves a single post by its ID.
   * @param {number} postId - The ID of the post to retrieve.
   * @param {string} token - The Bearer token for authorization.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  getOnePost: (postId, token) => {
    return request(app)
      .get(`${POSTS_ENDPOINT}${postId}`)
      .set("Authorization", `Bearer ${token}`);
  },

  /**
   * Creates a new post.
   * @param {object} userData - The data for the new post.
   * @param {string} token - The Bearer token for authorization.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  createPost: (userData, token) => {
    return request(app)
      .post(POSTS_ENDPOINT)
      .set("Authorization", `Bearer ${token}`)
      .send(userData);
  },

  /**
   * Updates an existing post by its ID.
   * @param {number} postId - The ID of the post to update.
   * @param {string} token - The Bearer token for authorization.
   * @param {object} userUpdateData - The updated data for the post.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  updatePost: (postId, token, userUpdateData) => {
    return request(app)
      .put(`${POSTS_ENDPOINT}${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(userUpdateData);
  },

  /**
   * Deletes a post by its ID.
   * @param {number} postId - The ID of the post to delete.
   * @param {string} token - The Bearer token for authorization.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  deletePost: (postId, token) => {
    return request(app)
      .delete(`${POSTS_ENDPOINT}${postId}`)
      .set("Authorization", `Bearer ${token}`);
  },
};

module.exports = { API, POSTS_ENDPOINT };
