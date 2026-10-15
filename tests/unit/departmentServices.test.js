jest.mock('../../models', () => {
  return {
    Department: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      findAndCountAll: jest.fn(),
      findAll: jest.fn(),
    },
    Employee: {
      count: jest.fn(),
    },
  };
});

const { Department, Employee } = require('../../models');
const {
  addDepartmentService,
  updateDepartmentService,
  getSingleDepartmentService,
  getDepartmentsListService,
  deleteDepartmentService,
} = require('../../src/department/services/departmentServices');

describe('Department Services Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addDepartmentService', () => {
    test('validates required department_name', async () => {
      const result = await addDepartmentService({});
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('prevents duplicate department name', async () => {
      Department.findOne.mockResolvedValue({ id: 1, department_name: 'Engineering' });
      const result = await addDepartmentService({ department_name: 'Engineering' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Conflict');
    });

    test('creates new department successfully', async () => {
      Department.findOne.mockResolvedValue(null);
      Department.create.mockResolvedValue({ id: 2, department_name: 'Finance' });
      const result = await addDepartmentService({ department_name: 'Finance' });
      expect(result.success).toBe(true);
      expect(result.data.department_name).toBe('Finance');
    });
  });

  describe('updateDepartmentService', () => {
    test('validates department ID is required', async () => {
      const result = await updateDepartmentService({ department_name: 'Tech' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('returns not found if department does not exist', async () => {
      Department.findOne.mockResolvedValue(null);
      const result = await updateDepartmentService({ id: 999, department_name: 'Tech' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('updates department name successfully', async () => {
      const mockDept = {
        id: 1,
        department_name: 'Old',
        save: jest.fn().mockResolvedValue(true),
      };
      Department.findOne
        .mockResolvedValueOnce(mockDept) // find department to update
        .mockResolvedValueOnce(null); // duplicate check passes

      const result = await updateDepartmentService({ id: 1, department_name: 'New' });
      expect(result.success).toBe(true);
      expect(mockDept.save).toHaveBeenCalled();
    });
  });

  describe('getSingleDepartmentService', () => {
    test('validates department_id', async () => {
      const result = await getSingleDepartmentService();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('returns not found when department does not exist', async () => {
      Department.findOne.mockResolvedValue(null);
      const result = await getSingleDepartmentService(999);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('returns department with employee count', async () => {
      Department.findOne.mockResolvedValue({
        id: 1,
        department_name: 'Engineering',
        toJSON: () => ({ id: 1, department_name: 'Engineering' }),
      });
      Employee.count.mockResolvedValue(15);

      const result = await getSingleDepartmentService(1);
      expect(result.success).toBe(true);
      expect(result.data.employee_count).toBe(15);
    });
  });

  describe('getDepartmentsListService', () => {
    test('fetches unpaginated list when all=true', async () => {
      const mockDepts = [{ id: 1, department_name: 'Engineering' }, { id: 2, department_name: 'HR' }];
      Department.findAll.mockResolvedValue(mockDepts);

      const result = await getDepartmentsListService({ all: true });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDepts);
      expect(result.totalRecords).toBe(2);
    });

    test('fetches paginated list when page and limit are provided', async () => {
      Department.findAndCountAll.mockResolvedValue({
        count: 10,
        rows: [{ id: 1, department_name: 'Engineering' }],
      });

      const result = await getDepartmentsListService({ page: 1, limit: 10 });
      expect(result.success).toBe(true);
      expect(result.pagination.totalRecords).toBe(10);
    });
  });

  describe('deleteDepartmentService', () => {
    test('validates department ID is provided', async () => {
      const result = await deleteDepartmentService();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('prevents deleting department if active employees are assigned', async () => {
      Department.findOne.mockResolvedValue({ id: 1 });
      Employee.count.mockResolvedValue(5);

      const result = await deleteDepartmentService(1);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Conflict');
      expect(result.message).toContain('Cannot delete');
    });

    test('deletes department when no employees are assigned', async () => {
      const mockDept = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Department.findOne.mockResolvedValue(mockDept);
      Employee.count.mockResolvedValue(0);

      const result = await deleteDepartmentService(1);
      expect(result.success).toBe(true);
      expect(mockDept.destroy).toHaveBeenCalled();
    });
  });
});
