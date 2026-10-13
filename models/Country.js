
"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Country = sequelize.define(
    "Country",
    {
        country_code: {
            type: DataTypes.CHAR(2),
            primaryKey: true,
            allowNull: false,
        },
        country_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        currency_code: {
            type: DataTypes.CHAR(3),
            allowNull: false,
        },
    },
    {
        tableName: "countries",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Country;