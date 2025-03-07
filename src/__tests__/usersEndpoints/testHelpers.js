const db = require("@src/database/models/sequelize_db");
/**
 * @type {import('sequelize').Sequelize}
 */
const sequelizeInstance = db.sequelize;
const { User } = sequelizeInstance.models;
const { Op } = require("sequelize");

async function clearUserTable() {
  await User.destroy({
    where: {},
  });
}

async function partialUserTableClear(value) {
  await User.destroy({
    where: {
      id: {
        [Op.ne]: value,
      },
    },
  });
}

async function createUser(userData) {
  return await User.create(userData);
}

// to avoid logging in after password change etc, less painful than supertest
async function findUserById(id) {
  return await User.findOne({
    where: {
      id,
    },
  });
}

module.exports = {
  clearUserTable,
  partialUserTableClear,
  findUserById,
  createUser,
};
