"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("users", "verifyToken", {
      type: Sequelize.STRING(150),
      after: "isVerify",
      defaultValue: null,
      unique: true,
    });
    await queryInterface.addColumn("users", "verifyTokenCreatedAt", {
      type: Sequelize.DATE,
      after: "verifyToken",
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("users", "verifyToken");
    await queryInterface.removeColumn("users", "verifyTokenCreatedAt");
  },
};
