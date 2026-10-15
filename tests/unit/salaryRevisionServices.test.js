jest.mock('../../models', () => {
  return {
    SalaryRevision: {
      findAndCountAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
    },
    Employee: {
      findByPk: jest.fn(),
    },
    Country: {},
    Department: {},
    Job: {},
    sequelize: {},
  };
});

const { SalaryRevision, Employee } = require('../../models');
const {
  addSalaryRevisionService,
  getSalaryRevisionsService,
  deleteSalaryRevisionService,
} = require('../../src/salaryRevision/services/salaryRevisionServices');

describe('Salary Revision Services Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addSalaryRevisionService', () => {
    test('validates required fields: employee_id, new_salary, effective_date', async () => {
      const result = await addSalaryRevisionService({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
      expect(result.message).toContain('required');
    });

    test('returns not found if target employee does not exist', async () => {
      Employee.findByPk.mockResolvedValue(null);

      const result = await addSalaryRevisionService({
        employee_id: 99,
        new_salary: 80000,
        effective_date: '2026-10-01',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('validates that new salary must be greater than zero', async () => {
      Employee.findByPk.mockResolvedValue({ id: 1, salary: 50000 });

      const result = await addSalaryRevisionService({
        employee_id: 1,
        new_salary: -1000,
        effective_date: '2026-10-01',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
      expect(result.message).toBe('New salary must be greater than zero');
    });

    test('calculates increment percentage and live updates employee base salary', async () => {
      const mockEmployee = {
        id: 1,
        salary: 50000,
        update: jest.fn().mockResolvedValue(true),
      };
      Employee.findByPk.mockResolvedValue(mockEmployee);

      const mockCreatedRevision = {
        id: 101,
        employee_id: 1,
        previous_salary: 50000,
        new_salary: 60000,
        increment_percentage: 20, // ((60000 - 50000) / 50000) * 100 = 20%
        effective_date: '2026-10-01',
      };
      SalaryRevision.create.mockResolvedValue(mockCreatedRevision);

      const result = await addSalaryRevisionService({
        employee_id: 1,
        new_salary: 60000,
        effective_date: '2026-10-01',
        revision_type: 'Annual Appraisal',
        remarks: 'Excellent performance rating',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedRevision);

      // Verify revision creation arguments
      expect(SalaryRevision.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employee_id: 1,
          previous_salary: 50000,
          new_salary: 60000,
          increment_percentage: 20,
          revision_type: 'Annual Appraisal',
        })
      );

      // Verify live synchronization of employee base salary
      expect(mockEmployee.update).toHaveBeenCalledWith({ salary: 60000 });
    });
  });

  describe('getSalaryRevisionsService', () => {
    test('fetches salary revision list with pagination and eager loading', async () => {
      const mockRows = [
        { id: 1, employee_id: 5, new_salary: 75000, increment_percentage: 15 },
      ];
      SalaryRevision.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockRows,
      });

      const result = await getSalaryRevisionsService({ page: 1, limit: 10, employee_id: 5 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRows);
      expect(result.pagination.totalRecords).toBe(1);
    });
  });

  describe('deleteSalaryRevisionService', () => {
    test('returns not found if revision record does not exist', async () => {
      SalaryRevision.findByPk.mockResolvedValue(null);

      const result = await deleteSalaryRevisionService(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('soft-deletes salary revision record successfully', async () => {
      const mockRevision = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      SalaryRevision.findByPk.mockResolvedValue(mockRevision);

      const result = await deleteSalaryRevisionService(1);

      expect(result.success).toBe(true);
      expect(mockRevision.destroy).toHaveBeenCalled();
    });
  });
});
