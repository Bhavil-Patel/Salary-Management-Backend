jest.mock('../../models', () => {
  return {
    Job: {
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

const { Job, Employee } = require('../../models');
const {
  addJobService,
  updateJobService,
  getSingleJobService,
  getJobsListService,
  deleteJobService,
} = require('../../src/jobs/services/jobsServices');

describe('Job Services Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addJobService', () => {
    test('validates required job_title', async () => {
      const result = await addJobService({});
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('prevents duplicate job title', async () => {
      Job.findOne.mockResolvedValue({ id: 1, job_title: 'Software Engineer' });
      const result = await addJobService({ job_title: 'Software Engineer' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Conflict');
    });

    test('creates job successfully', async () => {
      Job.findOne.mockResolvedValue(null);
      Job.create.mockResolvedValue({ id: 5, job_title: 'Product Manager' });
      const result = await addJobService({ job_title: 'Product Manager' });
      expect(result.success).toBe(true);
      expect(result.data.job_title).toBe('Product Manager');
    });
  });

  describe('updateJobService', () => {
    test('validates job ID is required', async () => {
      const result = await updateJobService({ job_title: 'Lead Architect' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('returns not found if job does not exist', async () => {
      Job.findOne.mockResolvedValue(null);
      const result = await updateJobService({ id: 999, job_title: 'Lead Architect' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('updates job title successfully', async () => {
      const mockJob = {
        id: 1,
        job_title: 'Old Title',
        save: jest.fn().mockResolvedValue(true),
      };
      Job.findOne
        .mockResolvedValueOnce(mockJob)
        .mockResolvedValueOnce(null);

      const result = await updateJobService({ id: 1, job_title: 'New Title' });
      expect(result.success).toBe(true);
      expect(mockJob.save).toHaveBeenCalled();
    });
  });

  describe('getSingleJobService', () => {
    test('validates job_id', async () => {
      const result = await getSingleJobService();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('returns not found if job does not exist', async () => {
      Job.findOne.mockResolvedValue(null);
      const result = await getSingleJobService(999);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('returns job with assigned employee count', async () => {
      Job.findOne.mockResolvedValue({
        id: 1,
        job_title: 'Backend Developer',
        toJSON: () => ({ id: 1, job_title: 'Backend Developer' }),
      });
      Employee.count.mockResolvedValue(8);

      const result = await getSingleJobService(1);
      expect(result.success).toBe(true);
      expect(result.data.employee_count).toBe(8);
    });
  });

  describe('getJobsListService', () => {
    test('fetches unpaginated list when all=true', async () => {
      const mockJobs = [{ id: 1, job_title: 'Developer' }, { id: 2, job_title: 'Designer' }];
      Job.findAll.mockResolvedValue(mockJobs);

      const result = await getJobsListService({ all: true });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJobs);
    });

    test('fetches paginated list of jobs', async () => {
      Job.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: [{ id: 1, job_title: 'Developer' }],
      });

      const result = await getJobsListService({ page: 1, limit: 10 });
      expect(result.success).toBe(true);
      expect(result.pagination.totalRecords).toBe(5);
    });
  });

  describe('deleteJobService', () => {
    test('validates job ID is provided', async () => {
      const result = await deleteJobService();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('blocks deletion if active employees are assigned', async () => {
      Job.findOne.mockResolvedValue({ id: 5 });
      Employee.count.mockResolvedValue(3);

      const result = await deleteJobService(5);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Conflict');
    });

    test('deletes job when no employees assigned', async () => {
      const mockJob = { id: 5, destroy: jest.fn().mockResolvedValue(true) };
      Job.findOne.mockResolvedValue(mockJob);
      Employee.count.mockResolvedValue(0);

      const result = await deleteJobService(5);
      expect(result.success).toBe(true);
      expect(mockJob.destroy).toHaveBeenCalled();
    });
  });
});
