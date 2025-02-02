"use strict";

const { DataTypes, Model } = require("sequelize");
const { sequelizeInstance } = require("@src/database/db.js");

// food, society, games, politics, meme

class Tag extends Model {}

Tag.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, unique: true },
  },
  {
    sequelize: sequelizeInstance,
    modelName: "tag",
    tableName: "tags",
    timestamps: false,
  }
);

module.exports = Tag;
