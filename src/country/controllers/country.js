const { addCountryService, updateCountryService, getSingleCountryService, getCountriesListService, deleteCountryService } = require("../services/countryServices");

function getErrorStatusCode(error) {
    switch (error) {
        case "Validation error":
            return 400;
        case "Not found":
            return 404;
        case "Conflict":
            return 409;
        default:
            return 500;
    }
}

async function addCountry(req, res) {
    try {
        const result = await addCountryService({ ...req.body });
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(201).json(result);
    } catch (error) {
        console.error("addCountry controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function updateCountry(req, res) {
    try {
        const id = req.params.id || req.params.country_id || req.params.country_code || req.body.country_id || req.body.id || req.body.country_code;
        const result = await updateCountryService({ ...req.body, id });
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("updateCountry controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getCountry(req, res) {
    try {
        const identifier = req.params.id || req.params.country_id || req.params.country_code;
        const result = await getSingleCountryService(identifier);
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("getCountry controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getCountriesList(req, res) {
    try {
        const { page, limit, search, country_name, country_code, all } = req.query;
        const result = await getCountriesListService({ page, limit, search, country_name, country_code, all });
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("getCountriesList controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function deleteCountry(req, res) {
    try {
        const identifier = req.params.id || req.params.country_id || req.params.country_code;
        const result = await deleteCountryService(identifier);
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("deleteCountry controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = { addCountry, updateCountry, getCountry, getCountriesList, deleteCountry };
