"use strict";

const { DataTypes, Model } = require("sequelize");
const { sequelizeInstance } = require("@src/database/db");

class Post extends Model {}

// Таблица Posts
Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: sequelizeInstance,
    modelName: "post",
    tableName: "posts",
    timestamps: true,
    createdAt: true,
    updatedAt: false,
  }
);

module.exports = Post;
