
"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("countries", {
            country_code: {
                type: Sequelize.CHAR(2),
                primaryKey: true,
                allowNull: false,
            },
            country_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            currency_code: {
                type: Sequelize.CHAR(3),
                allowNull: false,
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
        });

        await queryInterface.bulkInsert("countries", [
            {
                country_code: "IN",
                country_name: "India",
                currency_code: "INR",
            },
            {
                country_code: "US",
                country_name: "United States",
                currency_code: "USD",
            },
            {
                country_code: "GB",
                country_name: "United Kingdom",
                currency_code: "GBP",
            },
            {
                country_code: "CA",
                country_name: "Canada",
                currency_code: "CAD",
            },
            {
                country_code: "AU",
                country_name: "Australia",
                currency_code: "AUD",
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.dropTable("countries");
    },
};