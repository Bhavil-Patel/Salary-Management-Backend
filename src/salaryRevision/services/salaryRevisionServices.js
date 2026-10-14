const { Op } = require("sequelize");
const { SalaryRevision, Employee, Country, Department, Job, sequelize } = require("../../../models");

async function getSalaryRevisionsService({ page = 1, limit = 10, employee_id, search }) {
    try {
        const whereClause = {};
        if (employee_id) whereClause.employee_id = parseInt(employee_id, 10);

        const employeeWhere = {};
        if (search && search.trim()) {
            employeeWhere[Op.or] = [
                { full_name: { [Op.like]: `%${search.trim()}%` } },
                { email: { [Op.like]: `%${search.trim()}%` } },
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await SalaryRevision.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    where: Object.keys(employeeWhere).length > 0 ? employeeWhere : undefined,
                    include: [
                        { model: Department, as: 'department' },
                        { model: Job, as: 'job' },
                        { model: Country, as: 'country' },
                    ],
                },
            ],
            order: [['effective_date', 'DESC'], ['created_at', 'DESC']],
            limit,
            offset,
            distinct: true,
        });

        return {
            success: true,
            message: "Salary revisions fetched successfully",
            data: rows,
            pagination: {
                totalRecords: count,
                currentPage: page,
                limit,
                totalPages: Math.ceil(count / limit) || 1,
                hasNextPage: page < Math.ceil(count / limit),
                hasPreviousPage: page > 1,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch salary revisions",
            error: error.message,
        };
    }
}

async function addSalaryRevisionService({ employee_id, new_salary, effective_date, revision_type = "Annual Appraisal", remarks }) {
    try {
        if (!employee_id || !new_salary || !effective_date) {
            return {
                success: false,
                message: "Employee ID, new salary, and effective date are required",
                error: "Validation error",
            };
        }

        const employee = await Employee.findByPk(employee_id);
        if (!employee) {
            return {
                success: false,
                message: "Employee not found",
                error: "Not found",
            };
        }

        const previousSalary = Number(employee.salary) || 0;
        const newSalaryNum = Number(new_salary);

        if (newSalaryNum <= 0) {
            return {
                success: false,
                message: "New salary must be greater than zero",
                error: "Validation error",
            };
        }

        const incrementPercentage = previousSalary > 0
            ? Math.round(((newSalaryNum - previousSalary) / previousSalary) * 100 * 100) / 100
            : 0;

        // Create revision log
        const revision = await SalaryRevision.create({
            employee_id,
            previous_salary: previousSalary,
            new_salary: newSalaryNum,
            increment_percentage: incrementPercentage,
            effective_date,
            revision_type,
            remarks,
        });

        // Update employee's base salary directly!
        await employee.update({ salary: newSalaryNum });

        return {
            success: true,
            message: "Salary revision recorded and employee salary updated successfully",
            data: revision,
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to add salary revision",
            error: error.message,
        };
    }
}

async function deleteSalaryRevisionService(id) {
    try {
        const revision = await SalaryRevision.findByPk(id);
        if (!revision) {
            return {
                success: false,
                message: "Salary revision record not found",
                error: "Not found",
            };
        }

        await revision.destroy();

        return {
            success: true,
            message: "Salary revision deleted successfully",
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete salary revision",
            error: error.message,
        };
    }
}

module.exports = { getSalaryRevisionsService, addSalaryRevisionService, deleteSalaryRevisionService };
