jest.mock('../../models', () => {
  return {
    Employee: {
      findAll: jest.fn(),
    },
    Country: {},
    Department: {},
    Job: {},
    sequelize: {},
  };
});

const { Employee } = require('../../models');
const { getDashboardInsightsService } = require('../../src/dashboard/services/dashboardServices');

describe('Dashboard Services Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns zeroed metrics when no active employees exist', async () => {
    Employee.findAll.mockResolvedValue([]);

    const result = await getDashboardInsightsService();

    expect(result.success).toBe(true);
    expect(result.data.totalHeadcount).toBe(0);
    expect(result.data.avgSalary).toBe(0);
    expect(result.data.medianSalary).toBe(0);
    expect(result.data.byCountry).toEqual([]);
    expect(result.data.byDepartment).toEqual([]);
    expect(result.data.byJobTitle).toEqual([]);
    expect(result.data.distribution).toEqual([]);
  });

  test('computes aggregated metrics, groupings, and distribution histogram for employee dataset', async () => {
    const mockEmployees = [
      {
        id: 1,
        salary: 40000,
        country: { country_name: 'United States' },
        department: { department_name: 'Engineering' },
        job: { job_title: 'Software Engineer' },
      },
      {
        id: 2,
        salary: 60000,
        country: { country_name: 'United States' },
        department: { department_name: 'Engineering' },
        job: { job_title: 'Senior Engineer' },
      },
      {
        id: 3,
        salary: 80000,
        country: { country_name: 'India' },
        department: { department_name: 'Product' },
        job: { job_title: 'Product Lead' },
      },
    ];

    Employee.findAll.mockResolvedValue(mockEmployees);

    const result = await getDashboardInsightsService();

    expect(result.success).toBe(true);
    expect(result.data.totalHeadcount).toBe(3);
    // Average: (40k + 60k + 80k) / 3 = 60000
    expect(result.data.avgSalary).toBe(60000);
    // Median: 60000
    expect(result.data.medianSalary).toBe(60000);
    expect(result.data.minSalary).toBe(40000);
    expect(result.data.maxSalary).toBe(80000);

    // Grouping by country
    expect(result.data.byCountry).toHaveLength(2);
    const usGroup = result.data.byCountry.find((g) => g.label === 'United States');
    expect(usGroup).toBeDefined();
    expect(usGroup.headcount).toBe(2);
    expect(usGroup.avg).toBe(50000);

    // Grouping by department
    expect(result.data.byDepartment).toHaveLength(2);
    const engGroup = result.data.byDepartment.find((g) => g.label === 'Engineering');
    expect(engGroup.headcount).toBe(2);

    // Distribution histogram
    expect(result.data.distribution).toHaveLength(6);
    const totalDistributionCount = result.data.distribution.reduce((acc, b) => acc + b.count, 0);
    expect(totalDistributionCount).toBe(3);
  });

  test('handles unexpected database error cleanly', async () => {
    Employee.findAll.mockRejectedValue(new Error('Database unavailable'));

    const result = await getDashboardInsightsService();

    expect(result.success).toBe(false);
    expect(result.message).toBe('Failed to fetch dashboard insights');
    expect(result.error).toBe('Database unavailable');
  });
});
