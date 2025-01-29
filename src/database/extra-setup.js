function applyExtraSetup(sequelize) {
  const { user, post, comment } = sequelize.models;

  user.hasMany(post, { as: "posts", foreignKey: "userId" });
  post.belongsTo(user, { as: "user", foreignKey: "userId" });

  // creates postId in Comment model
  post.hasMany(comment, { as: "comments", foreignKey: "postId" });
  comment.belongsTo(post, { as: "post", foreignKey: "postId" });

  // creates userId in Comment model
  user.hasMany(comment, { as: "comments", foreignKey: "userId" });
  comment.belongsTo(user, { as: "user", foreignKey: "userId" });
}

module.exports = { applyExtraSetup };
