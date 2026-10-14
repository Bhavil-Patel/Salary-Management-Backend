const { Employee, Country, Department, Job, sequelize } = require("../../../models");

function getMedian(sortedArray) {
    const n = sortedArray.length;
    if (n === 0) return 0;
    const mid = Math.floor(n / 2);
    return n % 2 !== 0 ? sortedArray[mid] : Math.round((sortedArray[mid - 1] + sortedArray[mid]) / 2);
}

function generateDistributionBuckets(salaries, minSalary, maxSalary) {
    if (!salaries.length) return [];

    if (minSalary === maxSalary) {
        return [
            {
                range: `$${Math.round(minSalary / 1000)}k`,
                count: salaries.length
            }
        ];
    }

    const numBuckets = 6;
    const rawStep = (maxSalary - minSalary) / numBuckets;
    let step;
    if (rawStep <= 5000) step = Math.ceil(rawStep / 1000) * 1000 || 1000;
    else if (rawStep <= 15000) step = Math.ceil(rawStep / 2500) * 2500;
    else if (rawStep <= 50000) step = Math.ceil(rawStep / 5000) * 5000;
    else step = Math.ceil(rawStep / 10000) * 10000;

    const start = Math.floor(minSalary / step) * step;
    const buckets = [];

    let currentMin = start;
    for (let i = 0; i < numBuckets; i++) {
        const currentMax = i === numBuckets - 1 ? Infinity : currentMin + step;

        const count = salaries.filter((s) => {
            if (currentMax === Infinity) {
                return s >= currentMin;
            }
            return s >= currentMin && s < currentMax;
        }).length;

        const labelMin = currentMin >= 1000 ? `$${Math.round(currentMin / 1000)}k` : `$${currentMin}`;
        let rangeLabel;
        if (currentMax === Infinity) {
            rangeLabel = `${labelMin}+`;
        } else {
            const labelMax = currentMax >= 1000 ? `$${Math.round(currentMax / 1000)}k` : `$${currentMax}`;
            rangeLabel = `${labelMin} - ${labelMax}`;
        }

        buckets.push({
            range: rangeLabel,
            count
        });

        currentMin += step;
    }

    return buckets;
}

async function getDashboardInsightsService() {
    try {
        const employees = await Employee.findAll({
            attributes: ["id", "salary", "country_id", "department_id", "job_id"],
            include: [
                {
                    model: Country,
                    as: "country",
                    attributes: ["id", "country_name", "country_code", "currency_code"]
                },
                {
                    model: Department,
                    as: "department",
                    attributes: ["id", "department_name"]
                },
                {
                    model: Job,
                    as: "job",
                    attributes: ["id", "job_title"]
                }
            ],
            raw: false
        });

        const totalHeadcount = employees.length;

        if (totalHeadcount === 0) {
            return {
                success: true,
                message: "Dashboard insights fetched successfully (no employees found)",
                data: {
                    totalHeadcount: 0,
                    avgSalary: 0,
                    medianSalary: 0,
                    minSalary: 0,
                    maxSalary: 0,
                    byCountry: [],
                    byDepartment: [],
                    byJobTitle: [],
                    distribution: []
                }
            };
        }

        const salaries = employees
            .map((e) => Number(e.salary))
            .filter((s) => !isNaN(s) && s >= 0)
            .sort((a, b) => a - b);

        const n = salaries.length;
        const sum = salaries.reduce((acc, val) => acc + val, 0);
        const avgSalary = Math.round(sum / n);
        const minSalary = salaries[0];
        const maxSalary = salaries[n - 1];
        const medianSalary = getMedian(salaries);

        const calculateGroupMetrics = (getLabel) => {
            const groupMap = new Map();

            for (const emp of employees) {
                const label = getLabel(emp) || "Unassigned";
                if (!groupMap.has(label)) {
                    groupMap.set(label, []);
                }
                groupMap.get(label).push(Number(emp.salary));
            }

            const results = [];
            for (const [label, groupSalaries] of groupMap.entries()) {
                groupSalaries.sort((a, b) => a - b);
                const count = groupSalaries.length;
                const gSum = groupSalaries.reduce((acc, s) => acc + s, 0);
                const gAvg = Math.round(gSum / count);
                const gMin = groupSalaries[0];
                const gMax = groupSalaries[count - 1];
                const gMedian = getMedian(groupSalaries);

                results.push({
                    label,
                    headcount: count,
                    avg: gAvg,
                    median: gMedian,
                    min: gMin,
                    max: gMax
                });
            }

            return results.sort((a, b) => b.headcount - a.headcount);
        };

        const byCountry = calculateGroupMetrics((e) => e.country?.country_name);
        const byDepartment = calculateGroupMetrics((e) => e.department?.department_name);
        const byJobTitle = calculateGroupMetrics((e) => e.job?.job_title);
        const distribution = generateDistributionBuckets(salaries, minSalary, maxSalary);

        return {
            success: true,
            message: "Dashboard insights fetched successfully",
            data: {
                totalHeadcount,
                avgSalary,
                medianSalary,
                minSalary,
                maxSalary,
                byCountry,
                byDepartment,
                byJobTitle,
                distribution
            }
        };
    } catch (error) {
        console.error("getDashboardInsightsService error:", error);
        return {
            success: false,
            message: "Failed to fetch dashboard insights",
            error: error.message
        };
    }
}

module.exports = {
    getDashboardInsightsService
};
