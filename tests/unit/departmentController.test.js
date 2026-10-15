jest.mock('../../src/department/services/departmentServices', () => ({
  addDepartmentService: jest.fn(),
  updateDepartmentService: jest.fn(),
  getSingleDepartmentService: jest.fn(),
  getDepartmentsListService: jest.fn(),
  deleteDepartmentService: jest.fn(),
}));

const departmentServices = require('../../src/department/services/departmentServices');
const {
  addDepartment,
  updateDepartment,
  getDepartment,
  getDepartmentsList,
  deleteDepartment,
} = require('../../src/department/controllers/department');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Department Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addDepartment', () => {
    test('returns 201 on successful department creation', async () => {
      departmentServices.addDepartmentService.mockResolvedValue({
        success: true,
        message: 'Department created successfully',
        data: { id: 1, department_name: 'IT' },
      });
      const req = { body: { department_name: 'IT' } };
      const res = mockRes();

      await addDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('returns error status code when service fails', async () => {
      departmentServices.addDepartmentService.mockResolvedValue({
        success: false,
        message: 'Conflict',
        error: 'Conflict',
      });
      const req = { body: { department_name: 'IT' } };
      const res = mockRes();

      await addDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('updateDepartment', () => {
    test('returns 200 on successful update', async () => {
      departmentServices.updateDepartmentService.mockResolvedValue({
        success: true,
        message: 'Department updated successfully',
        data: { id: 1, department_name: 'Tech' },
      });
      const req = { params: { id: 1 }, body: { department_name: 'Tech' } };
      const res = mockRes();

      await updateDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getDepartment', () => {
    test('returns 200 on successful fetch', async () => {
      departmentServices.getSingleDepartmentService.mockResolvedValue({
        success: true,
        data: { id: 1, department_name: 'IT' },
      });
      const req = { params: { id: 1 } };
      const res = mockRes();

      await getDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 404 when not found', async () => {
      departmentServices.getSingleDepartmentService.mockResolvedValue({
        success: false,
        error: 'Not found',
      });
      const req = { params: { id: 999 } };
      const res = mockRes();

      await getDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getDepartmentsList', () => {
    test('returns 200 on fetching list', async () => {
      departmentServices.getDepartmentsListService.mockResolvedValue({
        success: true,
        data: [{ id: 1 }],
      });
      const req = { query: { page: '1', limit: '10' } };
      const res = mockRes();

      await getDepartmentsList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteDepartment', () => {
    test('returns 200 on successful deletion', async () => {
      departmentServices.deleteDepartmentService.mockResolvedValue({
        success: true,
        message: 'Department deleted successfully',
      });
      const req = { params: { id: 1 } };
      const res = mockRes();

      await deleteDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns 409 if department has assigned employees', async () => {
      departmentServices.deleteDepartmentService.mockResolvedValue({
        success: false,
        error: 'Conflict',
      });
      const req = { params: { id: 1 } };
      const res = mockRes();

      await deleteDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });
});
