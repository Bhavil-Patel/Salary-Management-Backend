const { addJobService, updateJobService, getSingleJobService, getJobsListService, deleteJobService } = require("../services/jobsServices");

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

async function addJob(req, res) {
    try {
        const result = await addJobService({ ...req.body });
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(201).json(result);
    } catch (error) {
        console.error("addJob controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function updateJob(req, res) {
    try {
        const id = req.params.id || req.params.job_id || req.body.job_id || req.body.id;
        const result = await updateJobService({ ...req.body, id });
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("updateJob controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getJob(req, res) {
    try {
        const id = req.params.id || req.params.job_id;
        const result = await getSingleJobService(id);
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("getJob controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function getJobsList(req, res) {
    try {
        const { page, limit, search, job_title, all } = req.query;
        const result = await getJobsListService({ page, limit, search, job_title, all });
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("getJobsList controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

async function deleteJob(req, res) {
    try {
        const id = req.params.id || req.params.job_id;
        const result = await deleteJobService(id);
        if (!result.success) {
            return res.status(getErrorStatusCode(result.error)).json(result);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("deleteJob controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = { addJob, updateJob, getJob, getJobsList, deleteJob };
