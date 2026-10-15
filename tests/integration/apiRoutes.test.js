const request = require('supertest');

// Mock all backend services so route controllers can be tested in isolation
jest.mock('../../src/employees/services/employeesServices', () => ({
  addEmployeeService: jest.fn(),
  updateEmployeeService: jest.fn(),
  getSingleEmployeeService: jest.fn(),
  getEmployeesListService: jest.fn(),
  deleteEmployeeService: jest.fn(),
}));

jest.mock('../../src/payroll/services/payrollServices', () => ({
  getPayrollListService: jest.fn(),
  getPayrollByIdService: jest.fn(),
  generateMonthlyPayrollService: jest.fn(),
  createPayrollService: jest.fn(),
  updatePayrollService: jest.fn(),
  markPayrollPaidService: jest.fn(),
  bulkMarkPaidService: jest.fn(),
  deletePayrollService: jest.fn(),
  calculateSalaryBreakdown: jest.fn(),
}));

jest.mock('../../src/salaryRevision/services/salaryRevisionServices', () => ({
  getSalaryRevisionsService: jest.fn(),
  addSalaryRevisionService: jest.fn(),
  deleteSalaryRevisionService: jest.fn(),
}));

jest.mock('../../src/dashboard/services/dashboardServices', () => ({
  getDashboardInsightsService: jest.fn(),
  getMedian: jest.fn(),
  generateDistributionBuckets: jest.fn(),
}));

jest.mock('../../src/department/services/departmentServices', () => ({
  getDepartmentsListService: jest.fn(),
  getSingleDepartmentService: jest.fn(),
  addDepartmentService: jest.fn(),
  updateDepartmentService: jest.fn(),
  deleteDepartmentService: jest.fn(),
}));

jest.mock('../../src/jobs/services/jobsServices', () => ({
  getJobsListService: jest.fn(),
  getSingleJobService: jest.fn(),
  addJobService: jest.fn(),
  updateJobService: jest.fn(),
  deleteJobService: jest.fn(),
}));

jest.mock('../../src/country/services/countryServices', () => ({
  getCountriesListService: jest.fn(),
  getSingleCountryService: jest.fn(),
  addCountryService: jest.fn(),
  updateCountryService: jest.fn(),
  deleteCountryService: jest.fn(),
}));

const employeeServices = require('../../src/employees/services/employeesServices');
const payrollServices = require('../../src/payroll/services/payrollServices');
const salaryRevisionServices = require('../../src/salaryRevision/services/salaryRevisionServices');
const dashboardServices = require('../../src/dashboard/services/dashboardServices');
const departmentServices = require('../../src/department/services/departmentServices');
const jobServices = require('../../src/jobs/services/jobsServices');
const countryServices = require('../../src/country/services/countryServices');

const app = require('../../src/server');

describe('REST API Routes & Controller Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Employee Routes (/api/employees)', () => {
    test('GET /api/employees calls getEmployeesListService and returns 200', async () => {
      employeeServices.getEmployeesListService.mockResolvedValue({
        success: true,
        message: 'Employees fetched successfully',
        data: [{ id: 1, full_name: 'Alice' }],
        pagination: { totalRecords: 1, currentPage: 1, limit: 10, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/employees')
        .query({ page: 1, limit: 10, name: 'Alice' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(employeeServices.getEmployeesListService).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, limit: 10, name: 'Alice' })
      );
    });

    test('GET /api/employees/:employee_id returns employee details', async () => {
      employeeServices.getSingleEmployeeService.mockResolvedValue({
        success: true,
        message: 'Employee fetched successfully',
        data: { id: 1, full_name: 'Alice' },
      });

      const res = await request(app).get('/api/employees/1');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    test('POST /api/employees/add returns 200 on successful creation', async () => {
      employeeServices.addEmployeeService.mockResolvedValue({
        success: true,
        message: 'Employee added successfully',
        data: { id: 5, full_name: 'Bob' },
      });

      const res = await request(app)
        .post('/api/employees/add')
        .send({ full_name: 'Bob', email: 'bob@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(employeeServices.addEmployeeService).toHaveBeenCalled();
    });

    test('POST /api/employees/add returns 400 when validation fails', async () => {
      employeeServices.addEmployeeService.mockResolvedValue({
        success: false,
        message: 'All fields are required',
        error: 'Validation error',
      });

      const res = await request(app).post('/api/employees/add').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('PUT /api/employees/update returns 200 on update', async () => {
      employeeServices.updateEmployeeService.mockResolvedValue({
        success: true,
        message: 'Employee updated successfully',
        data: { id: 1, full_name: 'Updated Name' },
      });

      const res = await request(app)
        .put('/api/employees/update')
        .send({ employee_id: 1, full_name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('DELETE /api/employees/:employee_id returns 200 on soft delete', async () => {
      employeeServices.deleteEmployeeService.mockResolvedValue({
        success: true,
        message: 'Employee deleted successfully',
      });

      const res = await request(app).delete('/api/employees/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Payroll Routes (/api/payroll)', () => {
    test('GET /api/payroll returns payrolls and financial summary', async () => {
      payrollServices.getPayrollListService.mockResolvedValue({
        success: true,
        message: 'Payroll list fetched successfully',
        data: [{ id: 10, gross_salary: 50000 }],
        summary: { totalGross: 50000, totalNet: 45000 },
      });

      const res = await request(app)
        .get('/api/payroll')
        .query({ month: 10, year: 2026 });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.summary.totalGross).toBe(50000);
    });

    test('POST /api/payroll/generate auto-generates monthly payroll', async () => {
      payrollServices.generateMonthlyPayrollService.mockResolvedValue({
        success: true,
        message: 'Payroll processed: 5 created, 0 already existed.',
        data: { createdCount: 5, skippedCount: 0 },
      });

      const res = await request(app)
        .post('/api/payroll/generate')
        .send({ month: 10, year: 2026, bonus_percentage: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.createdCount).toBe(5);
    });

    test('POST /api/payroll/create creates a manual payroll entry', async () => {
      payrollServices.createPayrollService.mockResolvedValue({
        success: true,
        message: 'Payroll entry created successfully',
        data: { id: 101, gross_salary: 60000 },
      });

      const res = await request(app)
        .post('/api/payroll/create')
        .send({ employee_id: 1, month: 10, year: 2026, bonus: 5000 });

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(101);
    });

    test('POST /api/payroll/:id/pay marks individual payroll as PAID', async () => {
      payrollServices.markPayrollPaidService.mockResolvedValue({
        success: true,
        message: 'Payroll marked as PAID successfully',
        data: { id: 10, status: 'PAID' },
      });

      const res = await request(app)
        .post('/api/payroll/10/pay')
        .send({ payment_method: 'BANK_TRANSFER' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('PAID');
    });

    test('POST /api/payroll/bulk-pay marks all matching payrolls as PAID', async () => {
      payrollServices.bulkMarkPaidService.mockResolvedValue({
        success: true,
        message: '8 payroll records marked as PAID.',
        data: { affectedCount: 8 },
      });

      const res = await request(app)
        .post('/api/payroll/bulk-pay')
        .send({ month: 10, year: 2026 });

      expect(res.status).toBe(200);
      expect(res.body.data.affectedCount).toBe(8);
    });

    test('DELETE /api/payroll/:id soft-deletes payroll entry', async () => {
      payrollServices.deletePayrollService.mockResolvedValue({
        success: true,
        message: 'Payroll deleted successfully',
      });

      const res = await request(app).delete('/api/payroll/10');

      expect(res.status).toBe(200);
    });
  });

  describe('Salary Revision Routes (/api/salary-revisions)', () => {
    test('GET /api/salary-revisions returns revision list', async () => {
      salaryRevisionServices.getSalaryRevisionsService.mockResolvedValue({
        success: true,
        message: 'Salary revisions fetched successfully',
        data: [{ id: 1, increment_percentage: 15 }],
      });

      const res = await request(app).get('/api/salary-revisions');

      expect(res.status).toBe(200);
      expect(res.body.data[0].increment_percentage).toBe(15);
    });

    test('POST /api/salary-revisions/add creates revision and syncs base salary', async () => {
      salaryRevisionServices.addSalaryRevisionService.mockResolvedValue({
        success: true,
        message: 'Salary revision recorded and employee salary updated successfully',
        data: { id: 2, new_salary: 80000 },
      });

      const res = await request(app)
        .post('/api/salary-revisions/add')
        .send({
          employee_id: 1,
          new_salary: 80000,
          effective_date: '2026-10-01',
          revision_type: 'Promotion',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.new_salary).toBe(80000);
    });

    test('DELETE /api/salary-revisions/:id deletes revision record', async () => {
      salaryRevisionServices.deleteSalaryRevisionService.mockResolvedValue({
        success: true,
        message: 'Salary revision deleted successfully',
      });

      const res = await request(app).delete('/api/salary-revisions/1');

      expect(res.status).toBe(200);
    });
  });

  describe('Dashboard Analytics Route (/api/dashboard)', () => {
    test('GET /api/dashboard returns complete metrics payload', async () => {
      dashboardServices.getDashboardInsightsService.mockResolvedValue({
        success: true,
        message: 'Dashboard insights fetched successfully',
        data: {
          totalHeadcount: 100,
          avgSalary: 65000,
          medianSalary: 62000,
          minSalary: 30000,
          maxSalary: 150000,
          byCountry: [],
          byDepartment: [],
          byJobTitle: [],
          distribution: [],
        },
      });

      const res = await request(app).get('/api/dashboard');

      expect(res.status).toBe(200);
      expect(res.body.data.totalHeadcount).toBe(100);
      expect(res.body.data.medianSalary).toBe(62000);
    });
  });

  describe('Master Data Routes (Department, Job, Country)', () => {
    test('GET /api/department returns department listing', async () => {
      departmentServices.getDepartmentsListService.mockResolvedValue({
        success: true,
        message: 'Departments fetched successfully',
        data: [{ id: 1, department_name: 'Engineering' }],
      });

      const res = await request(app).get('/api/department');

      expect(res.status).toBe(200);
      expect(res.body.data[0].department_name).toBe('Engineering');
    });

    test('GET /api/job returns job listing', async () => {
      jobServices.getJobsListService.mockResolvedValue({
        success: true,
        message: 'Jobs fetched successfully',
        data: [{ id: 1, job_title: 'Full Stack Engineer' }],
      });

      const res = await request(app).get('/api/job');

      expect(res.status).toBe(200);
      expect(res.body.data[0].job_title).toBe('Full Stack Engineer');
    });

    test('GET /api/country returns country listing', async () => {
      countryServices.getCountriesListService.mockResolvedValue({
        success: true,
        message: 'Countries fetched successfully',
        data: [{ id: 1, country_name: 'India', country_code: 'IN', currency_code: 'INR' }],
      });

      const res = await request(app).get('/api/country');

      expect(res.status).toBe(200);
      expect(res.body.data[0].country_code).toBe('IN');
    });
  });
});
