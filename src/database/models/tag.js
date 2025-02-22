"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tag.belongsToMany(models.Post, {
        as: "posts",
        through: models.PostTags,
        foreignKey: "tagId",
        otherKey: "postId",
      });

      Tag.hasMany(models.PostTags, { as: "postTags" });
    }
  }
  Tag.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, unique: "name" },
    },
    {
      sequelize,
      modelName: "Tag",
      tableName: "tags",
      timestamps: false,
    }
  );
  return Tag;
};
