"use strict";
const {
  User,
  Post,
  Comment,
  Tag,
  PostTag,
} = require("@src/associations/models");

function defineAssociations() {
  // creates userId in Post model
  User.hasMany(Post, { as: "posts", foreignKey: "userId" });
  Post.belongsTo(User, { as: "user", foreignKey: "userId" });

  // creates postId in Comment model
  Post.hasMany(Comment, { as: "comments", foreignKey: "postId" });
  Comment.belongsTo(Post, { as: "post", foreignKey: "postId" });

  // creates userId in Comment model
  User.hasMany(Comment, { as: "comments", foreignKey: "userId" });
  Comment.belongsTo(User, { as: "user", foreignKey: "userId" });

  /* 
  Many to many: post can have one or more tags. Tags can belong to many posts
  postId, tagId
  */

  // ! ok, look into advanced associations, figure out if its worth it, then correct all resources behaviours
  Post.belongsToMany(Tag, {
    as: "tags",
    through: PostTag,
  });
  Tag.belongsToMany(Post, {
    as: "posts",
    through: PostTag,
  });
  /*
      Many to many query: 
      await Post.findAll({ 
        where: { userId: req.user.id },
        include: [{ model: Tag, as: "tags" }],
      });
  */

  Post.hasMany(PostTag);
  PostTag.belongsTo(Post);
  Tag.hasMany(PostTag);
  PostTag.belongsTo(Tag);

  /*
  ALLOWS TO QUERY JUNCTION TABLE and VICA VERSA
  Post.findAll({ include: PostTag }); // finds all posts and gets junction model, may be get junction model attribute w/o 3rd model
  Tag.findAll({ include: PostTag }); 
  PostTag.findAll({ include: Post }); // finds all PostTags junction model and all posts etc
  PostTag.findAll({ include: Tag });
  */

  /*
  may be later -> 
  1.add notes
  2.add association between notes and tags
  3. Many to many: every note can have one or more tags
  4. NoteTags -> junction model: noteId, tagId
  */
}

module.exports = defineAssociations;
