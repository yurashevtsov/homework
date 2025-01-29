"use strict";

const { sequelizeInstance } = require("@src/database/db");

// import models here (a function that accepts sequelize instance and initializes the model), for of loop, throw sequelize into them to "define models"
const modelDefiners = [
  require("@src/comment/commentModel"),
  require("@src/user/userModel"),
  require("@src/post/postModel"),
  // Add more models here...
];

// passes sequelize instance to models to actually define the model
for (let modelDefiner of modelDefiners) {
  modelDefiner(sequelizeInstance);
}

const { user, post, comment } = sequelizeInstance.models;

user.hasMany(post, { as: "posts", foreignKey: "userId" });
post.belongsTo(user, { as: "user", foreignKey: "userId" });

// creates postId in Comment model
post.hasMany(comment, { as: "comments", foreignKey: "postId" });
comment.belongsTo(post, { as: "post", foreignKey: "postId" });

// creates userId in Comment model
user.hasMany(comment, { as: "comments", foreignKey: "userId" });
comment.belongsTo(user, { as: "user", foreignKey: "userId" });

module.exports = {
  User: sequelizeInstance.models.user,
  Post: sequelizeInstance.models.post,
  Comment: sequelizeInstance.models.comment,
};
