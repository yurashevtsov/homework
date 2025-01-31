"use strict";
const { User, Post, Comment } = require("@src/associations/models");

function defineAssociations() {
  User.hasMany(Post, { as: "posts", foreignKey: "userId" });
  Post.belongsTo(User, { as: "user", foreignKey: "userId" });

  // creates postId in Comment model
  Post.hasMany(Comment, { as: "comments", foreignKey: "postId" });
  Comment.belongsTo(Post, { as: "post", foreignKey: "postId" });

  // creates userId in Comment model
  User.hasMany(Comment, { as: "comments", foreignKey: "userId" });
  Comment.belongsTo(User, { as: "user", foreignKey: "userId" });
}

module.exports = defineAssociations;
