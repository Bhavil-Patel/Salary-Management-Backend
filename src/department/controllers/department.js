const { addDepartmentService, updateDepartmentService, getSingleDepartmentService, getDepartmentsListService, deleteDepartmentService } = require("../services/departmentServices");

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

async function addDepartment(req, res) {
    try {
        const result = await addDepartmentService({ ...req.body });
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(201).json(result);
    } catch (error) {
        console.error("addDepartment controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function updateDepartment(req, res) {
    try {
        const id = req.params.id || req.params.department_id || req.body.department_id || req.body.id;
        const result = await updateDepartmentService({ ...req.body, id });
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("updateDepartment controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getDepartment(req, res) {
    try {
        const id = req.params.id || req.params.department_id;
        const result = await getSingleDepartmentService(id);
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("getDepartment controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getDepartmentsList(req, res) {
    try {
        const { page, limit, search, department_name, all } = req.query;
        const result = await getDepartmentsListService({ page, limit, search, department_name, all });
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("getDepartmentsList controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function deleteDepartment(req, res) {
    try {
        const id = req.params.id || req.params.department_id;
        const result = await deleteDepartmentService(id);
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("deleteDepartment controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = { addDepartment, updateDepartment, getDepartment, getDepartmentsList, deleteDepartment };
