"use strict";

const User = require("@src/resources/user/userModel.js");
const Post = require("@src/resources/post/postModel.js");
const Tag = require("@src/resources/tag/tagModel.js");
const PostTag = require("@src/associations/models/PostTag.js");

module.exports = {
  User,
  Post,
  Tag,
  PostTag,
};
