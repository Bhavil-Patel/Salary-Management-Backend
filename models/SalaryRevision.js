'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SalaryRevision extends Model {
    static associate(models) {
      SalaryRevision.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: 'employee',
      });
    }
  }

  SalaryRevision.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      previous_salary: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
      },
      new_salary: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
      },
      increment_percentage: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
      },
      effective_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      revision_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'Annual Appraisal',
      },
      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'SalaryRevision',
      tableName: 'salary_revisions',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
    }
  );

  return SalaryRevision;
};
