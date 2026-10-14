"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Department extends Model {
        static associate(models) {
            Department.hasMany(models.Employee, { foreignKey: "department_id", as: "employees", });
        }
    }

    Department.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            department_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
        },
        {
            sequelize,
            modelName: "Department",
            tableName: "departments",
            timestamps: true,
            paranoid: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at",
        }
    );

    return Department;
};