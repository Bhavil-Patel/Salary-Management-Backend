const { getPayrollListService, getPayrollByIdService, generateMonthlyPayrollService, createPayrollService, updatePayrollService, markPayrollPaidService, bulkMarkPaidService, deletePayrollService } = require("../services/payrollServices");

async function getPayrollList(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const { month, year, status, department_id, employee_id, search } = req.query;

        const result = await getPayrollListService({ page, limit, month, year, status, department_id, employee_id, search });
        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function getPayrollById(req, res) {
    try {
        const { id } = req.params;
        const result = await getPayrollByIdService(id);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function generateMonthlyPayroll(req, res) {
    try {
        const result = await generateMonthlyPayrollService(req.body);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function createPayroll(req, res) {
    try {
        const result = await createPayrollService(req.body);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function updatePayroll(req, res) {
    try {
        const { id } = req.params;
        const result = await updatePayrollService(id, req.body);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function markPayrollPaid(req, res) {
    try {
        const { id } = req.params;
        const result = await markPayrollPaidService(id, req.body);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function bulkMarkPaid(req, res) {
    try {
        const result = await bulkMarkPaidService(req.body);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

async function deletePayroll(req, res) {
    try {
        const { id } = req.params;
        const result = await deletePayrollService(id);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = { getPayrollList, getPayrollById, generateMonthlyPayroll, createPayroll, updatePayroll, markPayrollPaid, bulkMarkPaid, deletePayroll };
