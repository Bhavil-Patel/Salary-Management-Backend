"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Employee extends Model {
        static associate(models) {
            Employee.belongsTo(models.Country, { foreignKey: "country_id", as: "country", });
        }
    }

    Employee.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            full_name: {
                type: DataTypes.STRING(150),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            job_title: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            department: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            country_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "countries",
                    key: "id",
                },
            },
            salary: {
                type: DataTypes.DECIMAL(14, 2),
                allowNull: false,
            },
            hire_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Employee",
            tableName: "employees",
            timestamps: true,
            paranoid: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at",
        }
    );

    return Employee;
};