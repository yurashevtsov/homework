"use strict";

const { Sequelize, DataTypes, Model } = require("sequelize");
// const { sequelizeInstance } = require("@src/associationsHomework/database/db");

module.exports = (sequelize) => {
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
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      sequelize: sequelize,
      modelName: "post",
      tableName: "posts",
      timestamps: false,
    }
  );
};
