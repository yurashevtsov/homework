"use strict";
const { User, Post, Tag, PostTag } = require("@src/associations/models");

function defineAssociations() {
  // creates userId in Post model
  User.hasMany(Post, { as: "posts", foreignKey: "userId" });
  Post.belongsTo(User, { as: "user", foreignKey: "userId" });

  Post.belongsToMany(Tag, {
    as: "tags",
    through: PostTag,
  });
  Tag.belongsToMany(Post, {
    as: "posts",
    through: PostTag,
  });

  Post.hasMany(PostTag);
  PostTag.belongsTo(Post);
  
  Tag.hasMany(PostTag);
  PostTag.belongsTo(Tag);
}

module.exports = defineAssociations;
