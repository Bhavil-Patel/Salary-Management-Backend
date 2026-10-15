jest.mock('../../src/jobs/services/jobsServices', () => ({
  addJobService: jest.fn(),
  updateJobService: jest.fn(),
  getSingleJobService: jest.fn(),
  getJobsListService: jest.fn(),
  deleteJobService: jest.fn(),
}));

const jobServices = require('../../src/jobs/services/jobsServices');
const {
  addJob,
  updateJob,
  getJob,
  getJobsList,
  deleteJob,
} = require('../../src/jobs/controllers/jobs');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Job Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addJob', () => {
    test('returns 201 on job creation', async () => {
      jobServices.addJobService.mockResolvedValue({
        success: true,
        message: 'Job created successfully',
        data: { id: 1, job_title: 'Developer' },
      });
      const req = { body: { job_title: 'Developer' } };
      const res = mockRes();

      await addJob(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('returns 409 on duplicate title', async () => {
      jobServices.addJobService.mockResolvedValue({
        success: false,
        error: 'Conflict',
      });
      const req = { body: { job_title: 'Developer' } };
      const res = mockRes();

      await addJob(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('updateJob', () => {
    test('returns 200 on update', async () => {
      jobServices.updateJobService.mockResolvedValue({
        success: true,
        data: { id: 1 },
      });
      const req = { params: { id: 1 }, body: { job_title: 'Lead' } };
      const res = mockRes();

      await updateJob(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getJob', () => {
    test('returns 200 on fetch', async () => {
      jobServices.getSingleJobService.mockResolvedValue({
        success: true,
        data: { id: 1 },
      });
      const req = { params: { id: 1 } };
      const res = mockRes();

      await getJob(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getJobsList', () => {
    test('returns 200 on list', async () => {
      jobServices.getJobsListService.mockResolvedValue({
        success: true,
        data: [{ id: 1 }],
      });
      const req = { query: {} };
      const res = mockRes();

      await getJobsList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteJob', () => {
    test('returns 200 on delete', async () => {
      jobServices.deleteJobService.mockResolvedValue({
        success: true,
      });
      const req = { params: { id: 1 } };
      const res = mockRes();

      await deleteJob(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
