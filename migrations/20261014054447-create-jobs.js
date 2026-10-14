"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("jobs", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      job_title: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });

    const now = new Date();

    await queryInterface.bulkInsert("jobs", [
      "Senior Software Engineer",
      "Software Engineer",
      "Product Manager",
      "Sales Executive",
      "Marketing Specialist",
      "Accountant",
      "HR Generalist",
      "Operations Analyst",
    ].map((job_title) => ({
      job_title,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    })));
  },

  async down(queryInterface) {
    await queryInterface.dropTable("jobs");
  },
};