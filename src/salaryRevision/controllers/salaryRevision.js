const { getSalaryRevisionsService, addSalaryRevisionService, deleteSalaryRevisionService } = require("../services/salaryRevisionServices");

async function getSalaryRevisions(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
        const { employee_id, search } = req.query;

        const result = await getSalaryRevisionsService({ page, limit, employee_id, search });
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

async function addSalaryRevision(req, res) {
    try {
        const result = await addSalaryRevisionService(req.body);
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

async function deleteSalaryRevision(req, res) {
    try {
        const { id } = req.params;
        const result = await deleteSalaryRevisionService(id);
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

module.exports = { getSalaryRevisions, addSalaryRevision, deleteSalaryRevision };
