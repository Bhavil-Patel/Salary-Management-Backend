"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Country extends Model {
        static associate(models) {
            Country.hasMany(models.Employee, { foreignKey: "country_id", as: "employees", });
        }
    }

    Country.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            country_code: {
                type: DataTypes.CHAR(2),
                allowNull: false,
                unique: true,
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