"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("departments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      department_name: {
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

    await queryInterface.bulkInsert("departments", [
      "Engineering",
      "Sales",
      "Marketing",
      "Finance",
      "HR",
      "Operations",
    ].map((department_name) => ({
      department_name,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    })));
  },

  async down(queryInterface) {
    await queryInterface.dropTable("departments");
  },
};