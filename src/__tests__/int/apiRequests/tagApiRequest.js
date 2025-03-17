const request = require("supertest");
const app = require("@src/app");
const TAGS_ENDPOINT = "/api/homework/tags/";

const API = {
  /**
   * Retrieves all tags.
   * @param {string} token - The Bearer token for authorization.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  getAllTags: (token) => {
    return request(app)
      .get(TAGS_ENDPOINT)
      .set("Authorization", `Bearer ${token}`);
  },

  /**
   * Retrieves a single tag by its ID.
   * @param {number} tagId - The ID of the tag to retrieve.
   * @param {string} token - The Bearer token for authorization.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  getOneTag: (tagId, token) => {
    return request(app)
      .get(`${TAGS_ENDPOINT}${tagId}`)
      .set("Authorization", `Bearer ${token}`);
  },

  /**
   * Creates a new tag.
   * @param {object} tagData - The data for the new tag.
   * @param {string} token - The Bearer token for authorization.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  createtag: (tagData, token) => {
    return request(app)
      .tag(TAGS_ENDPOINT)
      .set("Authorization", `Bearer ${token}`)
      .send(tagData);
  },

  /**
   * Updates an existing tag by its ID.
   * @param {number} tagId - The ID of the tag to update.
   * @param {string} token - The Bearer token for authorization.
   * @param {object} tagUpdateData - The updated data for the tag.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  updatetag: (tagId, token, updateData) => {
    return request(app)
      .put(`${TAGS_ENDPOINT}${tagId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);
  },

  /**
   * Deletes a tag by its ID.
   * @param {number} tagId - The ID of the tag to delete.
   * @param {string} token - The Bearer token for authorization.
   * @returns {Promise<Response>} A promise that resolves to the response object.
   */
  deletetag: (tagId, token) => {
    return request(app)
      .delete(`${TAGS_ENDPOINT}${tagId}`)
      .set("Authorization", `Bearer ${token}`);
  },
};

module.exports = { API, TAGS_ENDPOINT };
