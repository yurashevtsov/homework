"use strict";

const { DataTypes, Model } = require("sequelize");
const passwordService = require("@src/auth/passwordService.js");
const { sequelizeInstance } = require("@src/database/db");

class User extends Model {
  toJSON() {
    const attributes = this.get();
    Reflect.deleteProperty(attributes, "password");
    return attributes;
  }
}

User.init(
  //model properties
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: "username",
      allowNull: false,
      validate: {
        isAlphanumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: "email",
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: "default.png",
    },
    changedPasswordAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  // options
  {
    sequelize: sequelizeInstance,
    modelName: "user",
    tableName: "users",
    timestamps: true, // to enable timestamps it must be set to true
    updatedAt: true, // I want to enable updatedAt timestamp to for JWT verification, if user was updated after JWT was issued
    createdAt: true,
    // by default password is hidden even if its required by another table, when I need password, another scope is defined to help with it
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
  }
);

User.addHook(
  "beforeSave",
  "passwordHashOnSaveOrUpdate",
  // eslint-disable-next-line no-unused-vars
  async (instance, options) => {
    if (instance.isNewRecord || instance.changed("password")) {
      const hashedPassword = await passwordService.hashPassword(
        instance.password
      );
      instance.password = hashedPassword;
      instance.changedPasswordAt = new Date();
    }
  }
);

module.exports = User;
