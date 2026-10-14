const {
    updateEmployeeService,
    addEmployeeService,
    getSingleEmployeeService,
    getEmployeesListService,
    deleteEmployeeService,
    getInsightsService,
    getMetaService
} = require("../services/employeesServices");

async function addEmployee(req, res) {
    try {
        const result = await addEmployeeService({ ...req.body });
        return res.status(result.success ? 200 : 400).json(result);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function updateEmployee(req, res) {
    try {
        const { employee_id } = req.body;
        const result = await updateEmployeeService({ ...req.body, employee_id });
        return res.status(result.success ? 200 : 400).json(result);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getEmployee(req, res) {
    try {
        const { employee_id } = req.params;
        const result = await getSingleEmployeeService(employee_id);
        return res.status(result.success ? 200 : 400).json(result);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getEmployeesList(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
        const { name, job, department } = req.query;

        const result = await getEmployeesListService({ page, limit, name, job, department });

        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function deleteEmployee(req, res) {
    try {
        const { employee_id } = req.params;

        const result = await deleteEmployeeService(employee_id);

        if (!result.success) {
            const statusCode =
                result.error === "Validation error" ? 400 :
                    result.error === "Not found" ? 404 : 500;

            return res.status(statusCode).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("deleteEmployee controller error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    addEmployee,
    updateEmployee,
    getEmployee,
    getEmployeesList,
    deleteEmployee
};
