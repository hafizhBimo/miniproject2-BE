"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Blogs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
      },
      authorID: {
        type: Sequelize.INTEGER,
      },
      imgURL: {
        type: Sequelize.STRING,
      },
      category: {
        type: Sequelize.ENUM(
          "Umum",
          "Olahraga",
          "Ekonomi",
          "Politik",
          "Bisnis",
          "Fiksi"
        ),
      },
      content: {
        type: Sequelize.STRING,
      },
      videoURL: {
        type: Sequelize.STRING,
      },
      keywords: {
        type: Sequelize.STRING,
      },
      country: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Blogs");
  },
};
