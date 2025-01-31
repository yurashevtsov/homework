"use strict";

const { Sequelize, DataTypes, Model } = require("sequelize");
const { sequelizeInstance } = require("@src/database/db");

class Comment extends Model {}
// Таблица Comments
Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      references: {
        model: "posts",
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    modelName: "comment",
    tableName: "comments",
    timestamps: false,
    sequelize: sequelizeInstance,
  }
);

module.exports = Comment;
