const { Op } = require("sequelize");
const { Job, Employee } = require("../../../models");

async function addJobService({ data, ...rest }) {
    try {
        const payload = data || rest;
        const { job_title } = payload;

        if (!job_title || typeof job_title !== "string" || !job_title.trim()) {
            return {
                success: false,
                message: "job_title is required",
                error: "Validation error"
            };
        }

        const trimmedTitle = job_title.trim();

        const existingJob = await Job.findOne({ where: { job_title: { [Op.like]: trimmedTitle } } });

        if (existingJob) {
            return {
                success: false,
                message: `Job with title '${trimmedTitle}' already exists`,
                error: "Conflict"
            };
        }

        const newJob = await Job.create({ job_title: trimmedTitle });

        return {
            success: true,
            message: "Job created successfully",
            data: newJob
        };
    } catch (error) {
        console.error("addJobService error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function updateJobService({ data, job_id, id, ...rest }) {
    try {
        const payload = data || rest;
        const targetId = id || job_id || payload.id || payload.job_id;

        if (!targetId) {
            return {
                success: false,
                message: "Job ID is required",
                error: "Validation error"
            };
        }

        const job = await Job.findOne({ where: { id: targetId } });
        if (!job) {
            return {
                success: false,
                message: "Job not found",
                error: "Not found"
            };
        }

        const job_title = payload.job_title;
        if (job_title !== undefined) {
            if (typeof job_title !== "string" || !job_title.trim()) {
                return {
                    success: false,
                    message: "job_title cannot be empty",
                    error: "Validation error"
                };
            }

            const trimmedTitle = job_title.trim();

            const duplicate = await Job.findOne({
                where: {
                    job_title: {
                        [Op.like]: trimmedTitle
                    },
                    id: {
                        [Op.ne]: targetId
                    }
                }
            });

            if (duplicate) {
                return {
                    success: false,
                    message: `Another job with title '${trimmedTitle}' already exists`,
                    error: "Conflict"
                };
            }

            job.job_title = trimmedTitle;
        }

        await job.save();

        return {
            success: true,
            message: "Job updated successfully",
            data: job
        };
    } catch (error) {
        console.error("updateJobService error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function getSingleJobService(job_id) {
    try {
        if (!job_id) {
            return {
                success: false,
                message: "Job ID is required",
                error: "Validation error"
            };
        }

        const job = await Job.findOne({ where: { id: job_id } });

        if (!job) {
            return {
                success: false,
                message: "Job not found",
                error: "Not found"
            };
        }

        const employeeCount = await Employee.count({
            where: { job_id }
        });

        return {
            success: true,
            message: "Job fetched successfully",
            data: {
                ...job.toJSON(),
                employee_count: employeeCount
            }
        };
    } catch (error) {
        console.error("getSingleJobService error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function getJobsListService({ page, limit, search, job_title, all } = {}) {
    try {
        const where = {};
        const querySearch = search || job_title;

        if (querySearch && typeof querySearch === "string" && querySearch.trim()) {
            where.job_title = {
                [Op.like]: `%${querySearch.trim()}%`
            };
        }

        const isPaginated = page !== undefined || limit !== undefined;

        if (!isPaginated || all === "true" || all === true) {
            const jobs = await Job.findAll({
                where,
                order: [["id", "ASC"]]
            });

            return {
                success: true,
                message: "Jobs fetched successfully",
                totalRecords: jobs.length,
                data: jobs
            };
        }

        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (parsedPage - 1) * parsedLimit;

        const { count, rows } = await Job.findAndCountAll({
            where,
            limit: parsedLimit,
            offset,
            order: [["id", "ASC"]]
        });

        return {
            success: true,
            message: "Jobs fetched successfully",
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
        console.error("getJobsListService error:", error);
        return {
            success: false,
            message: "Failed to fetch jobs",
            error: error.message
        };
    }
}

async function deleteJobService(job_id) {
    try {
        if (!job_id) {
            return {
                success: false,
                message: "Job ID is required",
                error: "Validation error"
            };
        }

        const job = await Job.findOne({ where: { id: job_id } });

        if (!job) {
            return {
                success: false,
                message: "Job not found",
                error: "Not found"
            };
        }

        const employeeCount = await Employee.count({ where: { job_id } });

        if (employeeCount > 0) {
            return {
                success: false,
                message: `Cannot delete job: it is currently assigned to ${employeeCount} employee(s). Please reassign them first.`,
                error: "Conflict"
            };
        }

        await job.destroy();

        return {
            success: true,
            message: "Job deleted successfully"
        };
    } catch (error) {
        console.error("deleteJobService error:", error);
        return {
            success: false,
            message: "Failed to delete job",
            error: error.message
        };
    }
}

module.exports = { addJobService, updateJobService, getSingleJobService, getJobsListService, deleteJobService };
