jest.mock('../../models', () => {
  return {
    Country: {
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

const { Country, Employee } = require('../../models');
const {
  addCountryService,
  updateCountryService,
  getSingleCountryService,
  getCountriesListService,
  deleteCountryService,
} = require('../../src/country/services/countryServices');

describe('Country Services Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addCountryService', () => {
    test('validates country_code must be 2 characters (ISO alpha-2)', async () => {
      const result = await addCountryService({
        country_code: 'USA', // invalid
        country_name: 'United States',
        currency_code: 'USD',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('exactly 2 characters');
    });

    test('validates currency_code must be 3 characters (ISO 4217)', async () => {
      const result = await addCountryService({
        country_code: 'US',
        country_name: 'United States',
        currency_code: 'US', // invalid
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('exactly 3 characters');
    });

    test('creates country successfully with normalized uppercase codes', async () => {
      Country.findOne.mockResolvedValue(null);
      Country.create.mockResolvedValue({
        id: 1,
        country_code: 'IN',
        country_name: 'India',
        currency_code: 'INR',
      });

      const result = await addCountryService({
        country_code: 'in',
        country_name: 'India',
        currency_code: 'inr',
      });

      expect(result.success).toBe(true);
      expect(Country.create).toHaveBeenCalledWith({
        country_code: 'IN',
        country_name: 'India',
        currency_code: 'INR',
      });
    });
  });

  describe('updateCountryService', () => {
    test('validates country ID is required', async () => {
      const result = await updateCountryService({ country_name: 'Germany' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('returns not found if country does not exist', async () => {
      Country.findOne.mockResolvedValue(null);
      const result = await updateCountryService({ id: 999, country_name: 'Germany' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('updates country successfully', async () => {
      const mockCountry = {
        id: 1,
        country_name: 'Old Name',
        save: jest.fn().mockResolvedValue(true),
      };
      Country.findOne
        .mockResolvedValueOnce(mockCountry)
        .mockResolvedValueOnce(null);

      const result = await updateCountryService({ id: 1, country_name: 'New Name' });
      expect(result.success).toBe(true);
      expect(mockCountry.save).toHaveBeenCalled();
    });
  });

  describe('getSingleCountryService', () => {
    test('validates country_id', async () => {
      const result = await getSingleCountryService();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('returns not found if country does not exist', async () => {
      Country.findOne.mockResolvedValue(null);
      const result = await getSingleCountryService(999);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
    });

    test('returns country with employee count', async () => {
      Country.findOne.mockResolvedValue({
        id: 1,
        country_name: 'India',
        toJSON: () => ({ id: 1, country_name: 'India' }),
      });
      Employee.count.mockResolvedValue(25);

      const result = await getSingleCountryService(1);
      expect(result.success).toBe(true);
      expect(result.data.employee_count).toBe(25);
    });
  });

  describe('getCountriesListService', () => {
    test('fetches unpaginated list when all=true', async () => {
      const mockCountries = [{ id: 1, country_name: 'India' }, { id: 2, country_name: 'US' }];
      Country.findAll.mockResolvedValue(mockCountries);

      const result = await getCountriesListService({ all: true });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCountries);
    });

    test('fetches paginated list of countries', async () => {
      Country.findAndCountAll.mockResolvedValue({
        count: 5,
        rows: [{ id: 1, country_name: 'India' }],
      });

      const result = await getCountriesListService({ page: 1, limit: 10 });
      expect(result.success).toBe(true);
      expect(result.pagination.totalRecords).toBe(5);
    });
  });

  describe('deleteCountryService', () => {
    test('validates country ID is provided', async () => {
      const result = await deleteCountryService();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    test('prevents deletion if employees assigned', async () => {
      Country.findOne.mockResolvedValue({ id: 1 });
      Employee.count.mockResolvedValue(12);

      const result = await deleteCountryService(1);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Conflict');
    });

    test('deletes country when no employees assigned', async () => {
      const mockCountry = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Country.findOne.mockResolvedValue(mockCountry);
      Employee.count.mockResolvedValue(0);

      const result = await deleteCountryService(1);
      expect(result.success).toBe(true);
      expect(mockCountry.destroy).toHaveBeenCalled();
    });
  });
});
