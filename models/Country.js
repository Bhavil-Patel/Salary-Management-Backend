"use strict";

const { Model, Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Country extends Model {
        static associate(models) {
            Country.hasMany(models.Employee, { foreignKey: "country_id", as: "employees", });
        }
    }

    Country.init(
        {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            country_code: {
                type: Sequelize.STRING(2),
                allowNull: false,
                unique: true,
            },
            country_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            currency_code: {
                type: Sequelize.CHAR(3),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Country",
            tableName: "countries",
            timestamps: true,
            paranoid: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at",
        }
    );

    return Country;
};