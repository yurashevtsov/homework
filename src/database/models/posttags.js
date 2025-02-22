"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PostTags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PostTags.belongsTo(models.Post, { as: "post" });
      PostTags.belongsTo(models.Tag, { as: "tag" });
    }
  }
  PostTags.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      postId: {
        type: DataTypes.NUMBER,
        references: {
          model: "Posts",
          key: "id",
        },
      },
      tagId: {
        type: DataTypes.NUMBER,
        references: {
          model: "Tags",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "PostTags",
      tableName: "post_tags",
      timestamps: false,
    }
  );
  return PostTags;
};
