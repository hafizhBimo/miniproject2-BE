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
    await queryInterface.addColumn("users", "forgotToken", {
      type: Sequelize.STRING(150),
      after: "verifyTokenCreatedAt",
      defaultValue: null,
    });

    await queryInterface.addColumn("users", "forgotTokenCreatedAt", {
      type: Sequelize.DATE,
      after: "forgotToken",
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
    await queryInterface.removeColumn("users", "forgotToken");
    await queryInterface.removeColumn("users", "forgotTokenCreatedAt");
  },
};
