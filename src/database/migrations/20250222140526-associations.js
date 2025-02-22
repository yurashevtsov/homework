"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("PostTags", "postId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Posts",
        key: "id",
      },
    });

    await queryInterface.addColumn("PostTags", "tagId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Tags",
        key: "id",
      },
    });
  },
  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("PostTags", "tagId");
    await queryInterface.removeColumn("PostTags", "postId");
  },
};
