
"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Employee = sequelize.define(
    "Employee",
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
        country_code: {
            type: DataTypes.CHAR(2),
            allowNull: false,
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
        tableName: "employees",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Employee;