"use strict";

const { Model, DataTypes } = require("sequelize");
const { sequelizeInstance } = require("@src/database/db.js");

class PostTag extends Model {}

PostTag.init(
  {
    // required for "super many to many relationship"
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // add any additional attributes to junction model
  },
  {
    sequelize: sequelizeInstance,
    modelName: "postTag",
    tableName: "post_tags",
    timestamps: false,
  }
);

module.exports = PostTag;
