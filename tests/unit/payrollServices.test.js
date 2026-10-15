jest.mock('../../models', () => {
  return {
    Payroll: {
      findAndCountAll: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      bulkCreate: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    },
    Employee: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
    },
    Country: {},
    Department: {},
    Job: {},
    sequelize: {
      fn: jest.fn((name, col) => `${name}(${col})`),
      col: jest.fn((name) => name),
    },
  };
});

const {
  Payroll,
  Employee,
} = require('../../models');

const {
  getPayrollListService,
  getPayrollByIdService,
  generateMonthlyPayrollService,
  createPayrollService,
  updatePayrollService,
  markPayrollPaidService,
  bulkMarkPaidService,
  deletePayrollService,
} = require('../../src/payroll/services/payrollServices');

describe('Payroll Services Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPayrollListService', () => {
    test('fetches payroll list and calculates financial summary successfully', async () => {
      const mockPayrolls = [
        { id: 1, gross_salary: 50000, total_deductions: 5000, net_salary: 45000, status: 'PAID' },
        { id: 2, gross_salary: 60000, total_deductions: 6000, net_salary: 54000, status: 'PROCESSED' },
      ];

      Payroll.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockPayrolls,
      });

      Payroll.findAll.mockResolvedValue([
        {
          totalGross: '110000',
          totalDeductions: '11000',
          totalNet: '99000',
          totalCount: 2,
        },
      ]);

      Payroll.count
        .mockResolvedValueOnce(1) // paidCount
        .mockResolvedValueOnce(1); // processedCount

      const result = await getPayrollListService({ page: 1, limit: 10, month: 10, year: 2026 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPayrolls);
      expect(result.pagination.totalRecords).toBe(2);
      expect(result.summary.totalGross).toBe(110000);
      expect(result.summary.totalNet).toBe(99000);
      expect(result.summary.paidCount).toBe(1);
      expect(result.summary.processedCount).toBe(1);
    });

    test('returns failure response when database throws an error', async () => {
      Payroll.findAndCountAll.mockRejectedValue(new Error('DB Connection Timeout'));

      const result = await getPayrollListService({ page: 1, limit: 10 });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch payroll list');
      expect(result.error).toBe('DB Connection Timeout');
    });
  });

  describe('getPayrollByIdService', () => {
    test('returns single payroll details when found', async () => {
      const mockPayroll = { id: 1, employee_id: 10, gross_salary: 75000 };
      Payroll.findOne.mockResolvedValue(mockPayroll);

      const result = await getPayrollByIdService(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPayroll);
    });

    test('returns not found error when payroll does not exist', async () => {
      Payroll.findOne.mockResolvedValue(null);

      const result = await getPayrollByIdService(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });
  });

  describe('generateMonthlyPayrollService', () => {
    test('validates required month and year', async () => {
      const result = await generateMonthlyPayrollService({});

      expect(result.success).toBe(false);
      expect(result.message).toBe('Month and Year are required');
      expect(result.error).toBe('Validation error');
    });

    test('handles case where no active employees are found', async () => {
      Employee.findAll.mockResolvedValue([]);

      const result = await generateMonthlyPayrollService({ month: 10, year: 2026 });

      expect(result.success).toBe(false);
      expect(result.message).toBe('No employees found to process payroll for.');
    });

    test('generates payroll and skips employees already processed for that month/year', async () => {
      const mockEmployees = [
        { id: 1, salary: 50000 },
        { id: 2, salary: 60000 },
      ];
      Employee.findAll.mockResolvedValue(mockEmployees);

      // Employee 1 already has payroll generated
      Payroll.findAll.mockResolvedValue([{ employee_id: 1 }]);
      Payroll.bulkCreate.mockResolvedValue([]);

      const result = await generateMonthlyPayrollService({
        month: 10,
        year: 2026,
        bonus_percentage: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data.createdCount).toBe(1); // only employee 2
      expect(result.data.skippedCount).toBe(1); // employee 1 skipped
      expect(result.data.totalProcessed).toBe(2);
      expect(Payroll.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            employee_id: 2,
            month: 10,
            year: 2026,
            bonus: 6000, // 10% of 60,000
            payment_method: 'BANK_TRANSFER',
            status: 'PROCESSED',
          }),
        ])
      );
    });
  });

  describe('createPayrollService', () => {
    test('validates required fields: employee_id, month, year', async () => {
      const result = await createPayrollService({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('returns not found if employee does not exist', async () => {
      Employee.findByPk.mockResolvedValue(null);

      const result = await createPayrollService({ employee_id: 10, month: 10, year: 2026 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('rejects duplicate payroll for same employee and period', async () => {
      Employee.findByPk.mockResolvedValue({ id: 10, salary: 40000 });
      Payroll.findOne.mockResolvedValue({ id: 5 }); // duplicate exists

      const result = await createPayrollService({ employee_id: 10, month: 10, year: 2026 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Duplicate record');
    });

    test('creates manual payroll entry with computed breakdown', async () => {
      Employee.findByPk.mockResolvedValue({ id: 10, salary: 60000 });
      Payroll.findOne.mockResolvedValue(null);
      const createdRecord = { id: 15, employee_id: 10, gross_salary: 65000 };
      Payroll.create.mockResolvedValue(createdRecord);

      const result = await createPayrollService({
        employee_id: 10,
        month: 10,
        year: 2026,
        bonus: 5000,
        other_deductions: 500,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdRecord);
      expect(Payroll.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employee_id: 10,
          gross_salary: 65000,
          other_deductions: 500,
          status: 'PROCESSED',
        })
      );
    });
  });

  describe('updatePayrollService', () => {
    test('returns not found error if payroll does not exist', async () => {
      Payroll.findByPk.mockResolvedValue(null);

      const result = await updatePayrollService(999, { bonus: 1000 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('recalculates breakdown and updates record successfully', async () => {
      const mockRecord = {
        id: 1,
        employee_id: 10,
        basic_salary: 25000,
        bonus: 0,
        other_deductions: 0,
        payment_method: 'BANK_TRANSFER',
        status: 'PROCESSED',
        update: jest.fn().mockResolvedValue(true),
      };
      Payroll.findByPk.mockResolvedValue(mockRecord);
      Employee.findByPk.mockResolvedValue({ id: 10, salary: 50000 });

      const result = await updatePayrollService(1, { bonus: 2000, other_deductions: 500 });

      expect(result.success).toBe(true);
      expect(mockRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          bonus: 2000,
          gross_salary: 52000,
          other_deductions: 500,
        })
      );
    });
  });

  describe('markPayrollPaidService', () => {
    test('marks payroll as PAID with date and payment method', async () => {
      const mockRecord = {
        id: 1,
        status: 'PROCESSED',
        update: jest.fn().mockResolvedValue(true),
      };
      Payroll.findByPk.mockResolvedValue(mockRecord);

      const result = await markPayrollPaidService(1, {
        payment_date: '2026-10-31',
        payment_method: 'CHEQUE',
      });

      expect(result.success).toBe(true);
      expect(mockRecord.update).toHaveBeenCalledWith({
        status: 'PAID',
        payment_date: '2026-10-31',
        payment_method: 'CHEQUE',
      });
    });
  });

  describe('bulkMarkPaidService', () => {
    test('validates month and year', async () => {
      const result = await bulkMarkPaidService({});
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('updates all non-PAID records for the given period', async () => {
      Payroll.update.mockResolvedValue([5]); // 5 records updated

      const result = await bulkMarkPaidService({
        month: 10,
        year: 2026,
        payment_date: '2026-10-31',
      });

      expect(result.success).toBe(true);
      expect(result.data.affectedCount).toBe(5);
    });
  });

  describe('deletePayrollService', () => {
    test('soft-deletes payroll record', async () => {
      const mockRecord = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Payroll.findByPk.mockResolvedValue(mockRecord);

      const result = await deletePayrollService(1);

      expect(result.success).toBe(true);
      expect(mockRecord.destroy).toHaveBeenCalled();
    });

    test('returns not found if payroll does not exist', async () => {
      Payroll.findByPk.mockResolvedValue(null);

      const result = await deletePayrollService(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });
  });
});
