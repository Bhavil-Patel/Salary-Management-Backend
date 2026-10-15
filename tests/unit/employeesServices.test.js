jest.mock('../../models', () => {
  return {
    Employee: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findAll: jest.fn(),
    },
    Country: {},
    Department: {},
    Job: {},
    sequelize: {},
  };
});

const { Employee } = require('../../models');

const {
  addEmployeeService,
  updateEmployeeService,
  getSingleEmployeeService,
  getEmployeesListService,
  deleteEmployeeService,
} = require('../../src/employees/services/employeesServices');

describe('Employee Services Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addEmployeeService', () => {
    test('returns validation error if any mandatory field is missing', async () => {
      const incompletePayload = {
        full_name: 'John Doe',
        // missing email, job_id, department_id, etc.
      };

      const result = await addEmployeeService(incompletePayload);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
      expect(result.message).toBe('All fields are required');
    });

    test('returns validation error if email already exists', async () => {
      Employee.findOne.mockResolvedValue({ id: 1, email: 'john@example.com' });

      const payload = {
        full_name: 'John Doe',
        email: 'john@example.com',
        job_id: 1,
        department_id: 1,
        country_id: 1,
        salary: 50000,
        hire_date: '2026-01-15',
      };

      const result = await addEmployeeService(payload);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Employee with this email already exists');
      expect(result.error).toBe('Validation error');
    });

    test('creates employee successfully with valid payload', async () => {
      Employee.findOne.mockResolvedValue(null);
      const createdEmployee = {
        id: 10,
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        salary: 75000,
      };
      Employee.create.mockResolvedValue(createdEmployee);

      const payload = {
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        job_id: 2,
        department_id: 3,
        country_id: 1,
        salary: 75000,
        hire_date: '2026-02-01',
      };

      const result = await addEmployeeService(payload);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdEmployee);
      expect(result.message).toBe('Employee added successfully');
    });
  });

  describe('updateEmployeeService', () => {
    test('validates presence of employee ID', async () => {
      const result = await updateEmployeeService({ full_name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
      expect(result.message).toBe('Employee ID is required');
    });

    test('returns not found error if employee does not exist', async () => {
      Employee.findOne.mockResolvedValue(null);

      const result = await updateEmployeeService({ employee_id: 999, full_name: 'Non Existent' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('updates employee partially with provided fields', async () => {
      const mockEmployee = {
        id: 10,
        full_name: 'Old Name',
        email: 'old@example.com',
        salary: 50000,
        update: jest.fn().mockResolvedValue(true),
      };
      Employee.findOne.mockResolvedValue(mockEmployee);

      const result = await updateEmployeeService({
        employee_id: 10,
        salary: 60000,
      });

      expect(result.success).toBe(true);
      expect(mockEmployee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          salary: 60000,
        })
      );
    });
  });

  describe('getSingleEmployeeService', () => {
    test('validates presence of employee_id', async () => {
      const result = await getSingleEmployeeService();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('returns not found if employee record missing', async () => {
      Employee.findOne.mockResolvedValue(null);

      const result = await getSingleEmployeeService(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('returns employee details with eager loaded associations', async () => {
      const mockEmployee = {
        id: 10,
        full_name: 'Alice',
        country: { country_name: 'India' },
        department: { department_name: 'Engineering' },
        job: { job_title: 'Full Stack Engineer' },
      };
      Employee.findOne.mockResolvedValue(mockEmployee);

      const result = await getSingleEmployeeService(10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEmployee);
    });
  });

  describe('getEmployeesListService', () => {
    test('returns paginated list of employees with search and filters', async () => {
      const mockRows = [
        { id: 1, full_name: 'Bob', salary: 45000 },
        { id: 2, full_name: 'Charlie', salary: 55000 },
      ];
      Employee.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockRows,
      });

      const result = await getEmployeesListService({
        page: 1,
        limit: 10,
        name: 'Bob',
        department: '1',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRows);
      expect(result.pagination.totalRecords).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('deleteEmployeeService', () => {
    test('validates employee ID', async () => {
      const result = await deleteEmployeeService();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('returns not found if employee missing', async () => {
      Employee.findOne.mockResolvedValue(null);

      const result = await deleteEmployeeService(999);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('soft-deletes employee record successfully', async () => {
      const mockEmployee = { id: 10, destroy: jest.fn().mockResolvedValue(true) };
      Employee.findOne.mockResolvedValue(mockEmployee);

      const result = await deleteEmployeeService(10);

      expect(result.success).toBe(true);
      expect(mockEmployee.destroy).toHaveBeenCalled();
      expect(result.message).toBe('Employee deleted successfully');
    });
  });
});
