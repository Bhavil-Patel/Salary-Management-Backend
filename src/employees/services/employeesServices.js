const { Op } = require("sequelize");
const { Employee, Country, Department, Job, sequelize } = require("../../../models");

async function addEmployeeService({ data, ...rest }) {
    try {
        const payload = data || rest;
        const { full_name, email, job_id, department_id, country_id, salary, hire_date } = payload;
        if (!full_name || !email || !job_id || !department_id || !country_id || !salary || !hire_date) {
            return {
                success: false,
                message: "All fields are required",
                error: "Validation error"
            };
        }
        const employee = await Employee.findOne({ where: { email } });
        if (employee) {
            return {
                success: false,
                message: "Employee with this email already exists",
                error: "Validation error"
            };
        }
        const newEmployee = await Employee.create({
            full_name,
            email,
            job_id,
            department_id,
            country_id,
            salary,
            hire_date
        });
        return {
            success: true,
            message: "Employee added successfully",
            data: newEmployee
        };
    } catch (error) {
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function updateEmployeeService({ data, employee_id, ...rest }) {
    try {
        const payload = data || rest;
        const targetId = employee_id || payload.employee_id || payload.id;
        if (!targetId) {
            return {
                success: false,
                message: "Employee ID is required",
                error: "Validation error"
            };
        }
        const employee = await Employee.findOne({ where: { id: targetId } });
        if (!employee) {
            return {
                success: false,
                message: "Employee not found",
                error: "Not found"
            };
        }
        const { full_name, email, job_id, department_id, country_id, salary, hire_date } = payload;
        await employee.update({
            full_name: full_name !== undefined ? full_name : employee.full_name,
            email: email !== undefined ? email : employee.email,
            job_id: job_id !== undefined ? job_id : employee.job_id,
            department_id: department_id !== undefined ? department_id : employee.department_id,
            country_id: country_id !== undefined ? country_id : employee.country_id,
            salary: salary !== undefined ? salary : employee.salary,
            hire_date: hire_date !== undefined ? hire_date : employee.hire_date
        });
        return {
            success: true,
            message: "Employee updated successfully",
            data: employee
        };
    } catch (error) {
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function getSingleEmployeeService(employee_id) {
    try {
        if (!employee_id) {
            return {
                success: false,
                message: "Employee ID is required",
                error: "Validation error"
            };
        }
        const employee = await Employee.findOne({
            where: { id: employee_id },
            include: [
                { model: Country, as: "country" },
                { model: Department, as: "department" },
                { model: Job, as: "job" }
            ]
        });
        if (!employee) {
            return {
                success: false,
                message: "Employee not found",
                error: "Not found"
            };
        }
        return {
            success: true,
            message: "Employee fetched successfully",
            data: employee
        };
    } catch (error) {
        return {
            success: false,
            message: "Internal server error",
            error: error.message
        };
    }
}

async function getEmployeesListService({ page = 1, limit = 10, name, job, department } = {}) {
    try {
        const offset = (page - 1) * limit;

        const where = {};

        if (name && typeof name === "string" && name.trim()) {
            where.full_name = {
                [Op.like]: `%${name.trim()}%`
            };
        }

        if (job && job.trim() && job !== "ALL") {
            where.job_id = {
                [Op.like]: `%${job.trim()}%`
            };
        }

        if (department && department.trim() && department !== "ALL") {
            where.department_id = department.trim();
        }

        const { count, rows } = await Employee.findAndCountAll({
            where,
            limit,
            offset,
            order: [["id", "ASC"]],
            include: [
                { model: Country, as: "country" },
                { model: Department, as: "department" },
                { model: Job, as: "job" }
            ]
        });

        return {
            success: true,
            message: "Employees fetched successfully",
            data: rows,
            pagination: {
                totalRecords: count,
                currentPage: page,
                limit,
                totalPages: Math.ceil(count / limit),
                hasNextPage: page < Math.ceil(count / limit),
                hasPreviousPage: page > 1
            }
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch employees",
            error: error.message
        };
    }
}

async function deleteEmployeeService(employee_id) {
    try {
        if (!employee_id) {
            return {
                success: false,
                message: "Employee ID is required",
                error: "Validation error"
            };
        }

        const employee = await Employee.findOne({
            where: { id: employee_id }
        });

        if (!employee) {
            return {
                success: false,
                message: "Employee not found",
                error: "Not found"
            };
        }

        await employee.destroy();

        return {
            success: true,
            message: "Employee deleted successfully"
        };
    } catch (error) {
        console.error("deleteEmployeeService error:", error);

        return {
            success: false,
            message: "Failed to delete employee",
            error: error.message
        };
    }
}

module.exports = {
    addEmployeeService,
    updateEmployeeService,
    getSingleEmployeeService,
    getEmployeesListService,
    deleteEmployeeService
};
