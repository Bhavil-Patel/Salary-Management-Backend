const { Op } = require("sequelize");
const { Payroll, Employee, Country, Department, Job, sequelize } = require("../../../models");

const calculateSalaryBreakdown = (baseSalary, bonus = 0, customDeductions = 0) => {
    const salary = Number(baseSalary) || 0;
    const basic = Math.round(salary * 0.50 * 100) / 100;
    const hra = Math.round(salary * 0.20 * 100) / 100;
    const conveyance = Math.round(salary * 0.05 * 100) / 100;
    const medical = Math.round(salary * 0.05 * 100) / 100;
    const special = Math.round((salary - (basic + hra + conveyance + medical)) * 100) / 100;
    const bonusVal = Math.round(Number(bonus || 0) * 100) / 100;

    const gross = Math.round((basic + hra + conveyance + medical + special + bonusVal) * 100) / 100;

    const pf = Math.round(basic * 0.12 * 100) / 100;
    const pt = salary > 15000 ? 200 : 0;
    const annualEst = salary * 12;
    let tds = 0;
    if (annualEst > 1000000) {
        tds = Math.round(gross * 0.10 * 100) / 100;
    } else if (annualEst > 500000) {
        tds = Math.round(gross * 0.05 * 100) / 100;
    }
    const other = Math.round(Number(customDeductions || 0) * 100) / 100;
    const totalDeductions = Math.round((pf + pt + tds + other) * 100) / 100;
    const net = Math.max(0, Math.round((gross - totalDeductions) * 100) / 100);

    return {
        basic_salary: basic,
        hra,
        conveyance_allowance: conveyance,
        medical_allowance: medical,
        special_allowance: special,
        bonus: bonusVal,
        gross_salary: gross,
        pf_deduction: pf,
        professional_tax: pt,
        tds_tax: tds,
        other_deductions: other,
        total_deductions: totalDeductions,
        net_salary: net,
    };
};

async function getPayrollListService({ page = 1, limit = 10, month, year, status, department_id, employee_id, search }) {
    try {
        const whereClause = {};
        if (month) whereClause.month = parseInt(month, 10);
        if (year) whereClause.year = parseInt(year, 10);
        if (status && status !== 'ALL') whereClause.status = status;
        if (employee_id) whereClause.employee_id = parseInt(employee_id, 10);

        const employeeWhere = {};
        if (department_id && department_id !== 'ALL') {
            employeeWhere.department_id = parseInt(department_id, 10);
        }
        if (search && search.trim()) {
            employeeWhere[Op.or] = [
                { full_name: { [Op.like]: `%${search.trim()}%` } },
                { email: { [Op.like]: `%${search.trim()}%` } },
            ];
        }

        const offset = (page - 1) * limit;
        const hasEmployeeFilter = Reflect.ownKeys(employeeWhere).length > 0;

        const { count, rows } = await Payroll.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    required: hasEmployeeFilter,
                    where: hasEmployeeFilter ? employeeWhere : undefined,
                    include: [
                        { model: Department, as: 'department' },
                        { model: Job, as: 'job' },
                        { model: Country, as: 'country' },
                    ],
                },
            ],
            subQuery: false,
            order: [['created_at', 'DESC'], ['id', 'DESC']],
            limit,
            offset,
            distinct: true,
        });

        const employeeSummaryInclude = hasEmployeeFilter ? [
            {
                model: Employee,
                as: 'employee',
                attributes: [],
                required: true,
                where: employeeWhere,
            }
        ] : [];

        const allMatching = await Payroll.findAll({
            where: whereClause,
            include: employeeSummaryInclude,
            attributes: [
                [sequelize.fn('SUM', sequelize.col('gross_salary')), 'totalGross'],
                [sequelize.fn('SUM', sequelize.col('total_deductions')), 'totalDeductions'],
                [sequelize.fn('SUM', sequelize.col('net_salary')), 'totalNet'],
                [sequelize.fn('COUNT', sequelize.col('Payroll.id')), 'totalCount'],
            ],
            raw: true,
        });

        const paidCount = await Payroll.count({
            where: { ...whereClause, status: 'PAID' },
            include: employeeSummaryInclude,
            distinct: true,
        });
        const processedCount = await Payroll.count({
            where: { ...whereClause, status: 'PROCESSED' },
            include: employeeSummaryInclude,
            distinct: true,
        });

        const summary = {
            totalGross: Number(allMatching[0]?.totalGross || 0),
            totalDeductions: Number(allMatching[0]?.totalDeductions || 0),
            totalNet: Number(allMatching[0]?.totalNet || 0),
            totalCount: count,
            paidCount,
            processedCount,
        };

        return {
            success: true,
            message: "Payroll list fetched successfully",
            data: rows,
            pagination: {
                totalRecords: count,
                currentPage: page,
                limit,
                totalPages: Math.ceil(count / limit) || 1,
                hasNextPage: page < Math.ceil(count / limit),
                hasPreviousPage: page > 1,
            },
            summary,
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch payroll list",
            error: error.message,
        };
    }
}

async function getPayrollByIdService(id) {
    try {
        const payroll = await Payroll.findOne({
            where: { id },
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    include: [
                        { model: Department, as: 'department' },
                        { model: Job, as: 'job' },
                        { model: Country, as: 'country' },
                    ],
                },
            ],
        });

        if (!payroll) {
            return {
                success: false,
                message: "Payroll record not found",
                error: "Not found",
            };
        }

        return {
            success: true,
            message: "Payroll fetched successfully",
            data: payroll,
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch payroll",
            error: error.message,
        };
    }
}

async function generateMonthlyPayrollService({ month, year, department_id, bonus_percentage = 0 }) {
    try {
        if (!month || !year) {
            return {
                success: false,
                message: "Month and Year are required",
                error: "Validation error",
            };
        }

        const targetMonth = parseInt(month, 10);
        const targetYear = parseInt(year, 10);

        const employeeWhere = {};
        if (department_id && department_id !== 'ALL') {
            employeeWhere.department_id = parseInt(department_id, 10);
        }

        // Fetch eligible active employees
        const employees = await Employee.findAll({
            where: employeeWhere,
            include: [
                { model: Department, as: 'department' },
                { model: Job, as: 'job' },
                { model: Country, as: 'country' },
            ],
        });

        if (employees.length === 0) {
            return {
                success: false,
                message: "No employees found to process payroll for.",
                error: "No records",
            };
        }

        const existingPayrolls = await Payroll.findAll({
            where: {
                month: targetMonth,
                year: targetYear,
                employee_id: { [Op.in]: employees.map(e => e.id) },
            },
            attributes: ['employee_id'],
        });
        const existingSet = new Set(existingPayrolls.map(p => p.employee_id));

        const newRecords = [];
        for (const emp of employees) {
            if (existingSet.has(emp.id)) continue;

            const baseSalary = Number(emp.salary) || 0;
            const bonus = bonus_percentage > 0 ? Math.round(baseSalary * (bonus_percentage / 100)) : 0;
            const breakdown = calculateSalaryBreakdown(baseSalary, bonus, 0);

            newRecords.push({
                employee_id: emp.id,
                month: targetMonth,
                year: targetYear,
                ...breakdown,
                payment_method: 'BANK_TRANSFER',
                status: 'PROCESSED',
                remarks: bonus > 0 ? `Includes ${bonus_percentage}% performance bonus` : 'Regular monthly payroll',
            });
        }

        if (newRecords.length > 0) {
            await Payroll.bulkCreate(newRecords);
        }

        return {
            success: true,
            message: `Payroll processed: ${newRecords.length} created, ${existingSet.size} already existed.`,
            data: {
                createdCount: newRecords.length,
                skippedCount: existingSet.size,
                totalProcessed: employees.length,
            },
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to generate monthly payroll",
            error: error.message,
        };
    }
}

async function createPayrollService(payload) {
    try {
        const { employee_id, month, year, bonus = 0, other_deductions = 0, payment_method = 'BANK_TRANSFER', status = 'PROCESSED', remarks } = payload;
        if (!employee_id || !month || !year) {
            return {
                success: false,
                message: "Employee, month, and year are required",
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

        const existing = await Payroll.findOne({
            where: { employee_id, month: parseInt(month, 10), year: parseInt(year, 10) }
        });
        if (existing) {
            return {
                success: false,
                message: "Payroll already exists for this employee for the selected period",
                error: "Duplicate record",
            };
        }

        const breakdown = calculateSalaryBreakdown(employee.salary, bonus, other_deductions);

        const newPayroll = await Payroll.create({
            employee_id,
            month: parseInt(month, 10),
            year: parseInt(year, 10),
            ...breakdown,
            payment_method,
            status,
            remarks,
            payment_date: status === 'PAID' ? new Date() : null,
        });

        return {
            success: true,
            message: "Payroll entry created successfully",
            data: newPayroll,
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to create payroll",
            error: error.message,
        };
    }
}

async function updatePayrollService(id, payload) {
    try {
        const payroll = await Payroll.findByPk(id);
        if (!payroll) {
            return {
                success: false,
                message: "Payroll record not found",
                error: "Not found",
            };
        }

        const employee = await Employee.findByPk(payroll.employee_id);
        const baseSalary = employee ? Number(employee.salary) : Number(payroll.basic_salary) * 2;

        const bonus = payload.bonus !== undefined ? Number(payload.bonus) : Number(payroll.bonus);
        const other_deductions = payload.other_deductions !== undefined ? Number(payload.other_deductions) : Number(payroll.other_deductions);

        const breakdown = calculateSalaryBreakdown(baseSalary, bonus, other_deductions);

        await payroll.update({
            ...breakdown,
            payment_method: payload.payment_method || payroll.payment_method,
            payment_date: payload.payment_date !== undefined ? payload.payment_date : payroll.payment_date,
            status: payload.status || payroll.status,
            remarks: payload.remarks !== undefined ? payload.remarks : payroll.remarks,
        });

        return {
            success: true,
            message: "Payroll updated successfully",
            data: payroll,
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to update payroll",
            error: error.message,
        };
    }
}

async function markPayrollPaidService(id, { payment_date, payment_method = 'BANK_TRANSFER' }) {
    try {
        const payroll = await Payroll.findByPk(id);
        if (!payroll) {
            return {
                success: false,
                message: "Payroll record not found",
                error: "Not found",
            };
        }

        const date = payment_date || new Date().toISOString().split('T')[0];

        await payroll.update({
            status: 'PAID',
            payment_date: date,
            payment_method,
        });

        return {
            success: true,
            message: "Payroll marked as PAID successfully",
            data: payroll,
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to mark payroll as paid",
            error: error.message,
        };
    }
}

async function bulkMarkPaidService({ month, year, payment_date, payment_method = 'BANK_TRANSFER' }) {
    try {
        if (!month || !year) {
            return {
                success: false,
                message: "Month and Year are required",
                error: "Validation error",
            };
        }

        const date = payment_date || new Date().toISOString().split('T')[0];

        const [affectedCount] = await Payroll.update(
            {
                status: 'PAID',
                payment_date: date,
                payment_method,
            },
            {
                where: {
                    month: parseInt(month, 10),
                    year: parseInt(year, 10),
                    status: { [Op.ne]: 'PAID' },
                },
            }
        );

        return {
            success: true,
            message: `${affectedCount} payroll records marked as PAID.`,
            data: { affectedCount },
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to bulk mark payroll as paid",
            error: error.message,
        };
    }
}

async function deletePayrollService(id) {
    try {
        const payroll = await Payroll.findByPk(id);
        if (!payroll) {
            return {
                success: false,
                message: "Payroll record not found",
                error: "Not found",
            };
        }

        await payroll.destroy();

        return {
            success: true,
            message: "Payroll deleted successfully",
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete payroll",
            error: error.message,
        };
    }
}

module.exports = { getPayrollListService, getPayrollByIdService, generateMonthlyPayrollService, createPayrollService, updatePayrollService, markPayrollPaidService, bulkMarkPaidService, deletePayrollService };
