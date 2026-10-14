"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Job extends Model {
        static associate(models) {
            Job.hasMany(models.Employee, { foreignKey: "job_id", as: "employees", });
        }
    }

    Job.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            job_title: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
        },
        {
            sequelize,
            modelName: "Job",
            tableName: "jobs",
            timestamps: true,
            paranoid: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
            deletedAt: "deleted_at",
        }
    );

    return Job;
};