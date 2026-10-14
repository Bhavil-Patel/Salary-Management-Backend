const { Op } = require("sequelize");
const { Country, Employee } = require("../../../models");

async function addCountryService({ data, ...rest }) {
    try {
        const payload = data || rest;
        const { country_code, country_name, currency_code } = payload;

        if (!country_code || typeof country_code !== "string" || !country_code.trim()) {
            return {
                success: false,
                message: "country_code is required (2 characters, e.g., 'US', 'IN')",
                error: "Validation error"
            };
        }

        if (!country_name || typeof country_name !== "string" || !country_name.trim()) {
            return {
                success: false,
                message: "country_name is required",
                error: "Validation error"
            };
        }

        if (!currency_code || typeof currency_code !== "string" || !currency_code.trim()) {
            return {
                success: false,
                message: "currency_code is required (3 characters, e.g., 'USD', 'INR')",
                error: "Validation error"
            };
        }

        const formattedCode = country_code.trim().toUpperCase();
        const formattedName = country_name.trim();
        const formattedCurrency = currency_code.trim().toUpperCase();

        if (formattedCode.length !== 2) {
            return {
                success: false,
                message: "country_code must be exactly 2 characters (ISO alpha-2)",
                error: "Validation error"
            };
        }

        if (formattedCurrency.length !== 3) {
            return {
                success: false,
                message: "currency_code must be exactly 3 characters (ISO 4217)",
                error: "Validation error"
            };
        }

        const existingCountry = await Country.findOne({
            where: {
                [Op.or]: [
                    { country_code: formattedCode },
                    { country_name: { [Op.like]: formattedName } }
                ]
            }
        });

        if (existingCountry) {
            const conflictField = existingCountry.country_code === formattedCode ? "code" : "name";
            return {
                success: false,
                message: `Country with this ${conflictField} ('${conflictField === "code" ? formattedCode : formattedName}') already exists`,
                error: "Conflict"
            };
        }

        const newCountry = await Country.create({
            country_code: formattedCode,
            country_name: formattedName,
            currency_code: formattedCurrency
        });

        return {
            success: true,
            message: "Country created successfully",
            data: newCountry
        };
    } catch (error) {
        console.error("addCountryService error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function updateCountryService({ data, country_id, id, ...rest }) {
    try {
        const payload = data || rest;
        const targetId = id || country_id || payload.id || payload.country_id || payload.country_code;

        if (!targetId) {
            return {
                success: false,
                message: "Country identifier (ID or country_code) is required",
                error: "Validation error"
            };
        }

        const isNumeric = /^\d+$/.test(String(targetId).trim());
        const country = await Country.findOne({
            where: isNumeric
                ? { id: parseInt(targetId, 10) }
                : { country_code: String(targetId).trim().toUpperCase() }
        });

        if (!country) {
            return {
                success: false,
                message: "Country not found",
                error: "Not found"
            };
        }

        const { country_code, country_name, currency_code } = payload;

        if (country_code !== undefined) {
            if (typeof country_code !== "string" || !country_code.trim()) {
                return {
                    success: false,
                    message: "country_code cannot be empty",
                    error: "Validation error"
                };
            }
            const formattedCode = country_code.trim().toUpperCase();
            if (formattedCode.length !== 2) {
                return {
                    success: false,
                    message: "country_code must be exactly 2 characters",
                    error: "Validation error"
                };
            }

            const duplicateCode = await Country.findOne({
                where: {
                    country_code: formattedCode,
                    id: { [Op.ne]: country.id }
                }
            });

            if (duplicateCode) {
                return {
                    success: false,
                    message: `Another country with code '${formattedCode}' already exists`,
                    error: "Conflict"
                };
            }

            country.country_code = formattedCode;
        }

        if (country_name !== undefined) {
            if (typeof country_name !== "string" || !country_name.trim()) {
                return {
                    success: false,
                    message: "country_name cannot be empty",
                    error: "Validation error"
                };
            }
            const formattedName = country_name.trim();

            const duplicateName = await Country.findOne({
                where: {
                    country_name: { [Op.like]: formattedName },
                    id: { [Op.ne]: country.id }
                }
            });

            if (duplicateName) {
                return {
                    success: false,
                    message: `Another country with name '${formattedName}' already exists`,
                    error: "Conflict"
                };
            }

            country.country_name = formattedName;
        }

        if (currency_code !== undefined) {
            if (typeof currency_code !== "string" || !currency_code.trim()) {
                return {
                    success: false,
                    message: "currency_code cannot be empty",
                    error: "Validation error"
                };
            }
            const formattedCurrency = currency_code.trim().toUpperCase();
            if (formattedCurrency.length !== 3) {
                return {
                    success: false,
                    message: "currency_code must be exactly 3 characters",
                    error: "Validation error"
                };
            }
            country.currency_code = formattedCurrency;
        }

        await country.save();

        return {
            success: true,
            message: "Country updated successfully",
            data: country
        };
    } catch (error) {
        console.error("updateCountryService error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function getSingleCountryService(identifier) {
    try {
        if (!identifier) {
            return {
                success: false,
                message: "Country ID or code is required",
                error: "Validation error"
            };
        }

        const isNumeric = /^\d+$/.test(String(identifier).trim());
        const country = await Country.findOne({
            where: isNumeric
                ? { id: parseInt(identifier, 10) }
                : { country_code: String(identifier).trim().toUpperCase() }
        });

        if (!country) {
            return {
                success: false,
                message: "Country not found",
                error: "Not found"
            };
        }

        const employeeCount = await Employee.count({
            where: { country_id: country.id }
        });

        return {
            success: true,
            message: "Country fetched successfully",
            data: {
                ...country.toJSON(),
                employee_count: employeeCount
            }
        };
    } catch (error) {
        console.error("getSingleCountryService error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function getCountriesListService({ page, limit, search, country_name, country_code, all } = {}) {
    try {
        const where = {};
        const querySearch = search || country_name;

        if (querySearch && typeof querySearch === "string" && querySearch.trim()) {
            where[Op.or] = [
                { country_name: { [Op.like]: `%${querySearch.trim()}%` } },
                { country_code: { [Op.like]: `%${querySearch.trim()}%` } },
                { currency_code: { [Op.like]: `%${querySearch.trim()}%` } }
            ];
        }

        if (country_code && typeof country_code === "string" && country_code.trim()) {
            where.country_code = country_code.trim().toUpperCase();
        }

        const isPaginated = page !== undefined || limit !== undefined;

        if (!isPaginated || all === "true" || all === true) {
            const countries = await Country.findAll({
                where,
                order: [["id", "ASC"]]
            });

            return {
                success: true,
                message: "Countries fetched successfully",
                totalRecords: countries.length,
                data: countries
            };
        }

        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (parsedPage - 1) * parsedLimit;

        const { count, rows } = await Country.findAndCountAll({
            where,
            limit: parsedLimit,
            offset,
            order: [["id", "ASC"]]
        });

        return {
            success: true,
            message: "Countries fetched successfully",
            data: rows,
            pagination: {
                totalRecords: count,
                currentPage: parsedPage,
                limit: parsedLimit,
                totalPages: Math.ceil(count / parsedLimit),
                hasNextPage: parsedPage < Math.ceil(count / parsedLimit),
                hasPreviousPage: parsedPage > 1
            }
        };
    } catch (error) {
        console.error("getCountriesListService error:", error);
        return {
            success: false,
            message: "Failed to fetch countries",
            error: error.message
        };
    }
}

async function deleteCountryService(identifier) {
    try {
        if (!identifier) {
            return {
                success: false,
                message: "Country ID or code is required",
                error: "Validation error"
            };
        }

        const isNumeric = /^\d+$/.test(String(identifier).trim());
        const country = await Country.findOne({
            where: isNumeric
                ? { id: parseInt(identifier, 10) }
                : { country_code: String(identifier).trim().toUpperCase() }
        });

        if (!country) {
            return {
                success: false,
                message: "Country not found",
                error: "Not found"
            };
        }

        const employeeCount = await Employee.count({
            where: { country_id: country.id }
        });

        if (employeeCount > 0) {
            return {
                success: false,
                message: `Cannot delete country: it is currently assigned to ${employeeCount} employee(s). Please reassign them first.`,
                error: "Conflict"
            };
        }

        await country.destroy();

        return {
            success: true,
            message: "Country deleted successfully"
        };
    } catch (error) {
        console.error("deleteCountryService error:", error);
        return {
            success: false,
            message: "Failed to delete country",
            error: error.message
        };
    }
}

module.exports = { addCountryService, updateCountryService, getSingleCountryService, getCountriesListService, deleteCountryService };
