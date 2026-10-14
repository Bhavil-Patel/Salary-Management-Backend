'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('salary_revisions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      previous_salary: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
      },
      new_salary: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
      },
      increment_percentage: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
      },
      effective_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      revision_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'Annual Appraisal',
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
    });

    await queryInterface.addIndex('salary_revisions', ['employee_id']);
    await queryInterface.addIndex('salary_revisions', ['effective_date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('salary_revisions');
  },
};
