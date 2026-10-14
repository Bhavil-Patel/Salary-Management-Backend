const { Op } = require("sequelize");
const { Department, Employee } = require("../../../models");

async function addDepartmentService({ data, ...rest }) {
    try {
        const payload = data || rest;
        const { department_name } = payload;

        if (!department_name || typeof department_name !== "string" || !department_name.trim()) {
            return {
                success: false,
                message: "department_name is required",
                error: "Validation error"
            };
        }

        const trimmedName = department_name.trim();

        const existingDepartment = await Department.findOne({
            where: {
                department_name: {
                    [Op.like]: trimmedName
                }
            }
        });

        if (existingDepartment) {
            return {
                success: false,
                message: `Department '${trimmedName}' already exists`,
                error: "Conflict"
            };
        }

        const newDepartment = await Department.create({ department_name: trimmedName });

        return {
            success: true,
            message: "Department created successfully",
            data: newDepartment
        };
    } catch (error) {
        console.error("addDepartmentService error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function updateDepartmentService({ data, department_id, id, ...rest }) {
    try {
        const payload = data || rest;
        const targetId = id || department_id || payload.id || payload.department_id;

        if (!targetId) {
            return {
                success: false,
                message: "Department ID is required",
                error: "Validation error"
            };
        }

        const department = await Department.findOne({ where: { id: targetId } });
        if (!department) {
            return {
                success: false,
                message: "Department not found",
                error: "Not found"
            };
        }

        const department_name = payload.department_name;
        if (department_name !== undefined) {
            if (typeof department_name !== "string" || !department_name.trim()) {
                return {
                    success: false,
                    message: "department_name cannot be empty",
                    error: "Validation error"
                };
            }

            const trimmedName = department_name.trim();

            const duplicate = await Department.findOne({
                where: {
                    department_name: {
                        [Op.like]: trimmedName
                    },
                    id: {
                        [Op.ne]: targetId
                    }
                }
            });

            if (duplicate) {
                return {
                    success: false,
                    message: `Another department with name '${trimmedName}' already exists`,
                    error: "Conflict"
                };
            }

            department.department_name = trimmedName;
        }

        await department.save();

        return {
            success: true,
            message: "Department updated successfully",
            data: department
        };
    } catch (error) {
        console.error("updateDepartmentService error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function getSingleDepartmentService(department_id) {
    try {
        if (!department_id) {
            return {
                success: false,
                message: "Department ID is required",
                error: "Validation error"
            };
        }

        const department = await Department.findOne({ where: { id: department_id } });

        if (!department) {
            return {
                success: false,
                message: "Department not found",
                error: "Not found"
            };
        }

        const employeeCount = await Employee.count({
            where: { department_id }
        });

        return {
            success: true,
            message: "Department fetched successfully",
            data: {
                ...department.toJSON(),
                employee_count: employeeCount
            }
        };
    } catch (error) {
        console.error("getSingleDepartmentService error:", error);
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function getDepartmentsListService({ page, limit, search, department_name, all } = {}) {
    try {
        const where = {};
        const querySearch = search || department_name;

        if (querySearch && typeof querySearch === "string" && querySearch.trim()) {
            where.department_name = {
                [Op.like]: `%${querySearch.trim()}%`
            };
        }

        const isPaginated = page !== undefined || limit !== undefined;

        if (!isPaginated || all === "true" || all === true) {
            const departments = await Department.findAll({
                where,
                order: [["department_name", "ASC"]]
            });

            return {
                success: true,
                message: "Departments fetched successfully",
                totalRecords: departments.length,
                data: departments
            };
        }

        const parsedPage = Math.max(1, parseInt(page, 10) || 1);
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
        const offset = (parsedPage - 1) * parsedLimit;

        const { count, rows } = await Department.findAndCountAll({
            where,
            limit: parsedLimit,
            offset,
            order: [["id", "ASC"]]
        });

        return {
            success: true,
            message: "Departments fetched successfully",
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
        console.error("getDepartmentsListService error:", error);
        return {
            success: false,
            message: "Failed to fetch departments",
            error: error.message
        };
    }
}

async function deleteDepartmentService(department_id) {
    try {
        if (!department_id) {
            return {
                success: false,
                message: "Department ID is required",
                error: "Validation error"
            };
        }

        const department = await Department.findOne({
            where: { id: department_id }
        });

        if (!department) {
            return {
                success: false,
                message: "Department not found",
                error: "Not found"
            };
        }

        const employeeCount = await Employee.count({
            where: { department_id }
        });

        if (employeeCount > 0) {
            return {
                success: false,
                message: `Cannot delete department: it is currently assigned to ${employeeCount} employee(s). Please reassign them first.`,
                error: "Conflict"
            };
        }

        await department.destroy();

        return {
            success: true,
            message: "Department deleted successfully"
        };
    } catch (error) {
        console.error("deleteDepartmentService error:", error);
        return {
            success: false,
            message: "Failed to delete department",
            error: error.message
        };
    }
}

module.exports = { addDepartmentService, updateDepartmentService, getSingleDepartmentService, getDepartmentsListService, deleteDepartmentService };
