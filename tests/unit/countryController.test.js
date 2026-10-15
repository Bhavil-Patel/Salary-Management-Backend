jest.mock('../../src/country/services/countryServices', () => ({
  addCountryService: jest.fn(),
  updateCountryService: jest.fn(),
  getSingleCountryService: jest.fn(),
  getCountriesListService: jest.fn(),
  deleteCountryService: jest.fn(),
}));

const countryServices = require('../../src/country/services/countryServices');
const {
  addCountry,
  updateCountry,
  getCountry,
  getCountriesList,
  deleteCountry,
} = require('../../src/country/controllers/country');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Country Controller Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addCountry', () => {
    test('returns 201 on valid country creation', async () => {
      countryServices.addCountryService.mockResolvedValue({
        success: true,
        message: 'Country created successfully',
        data: { id: 1, country_code: 'IN' },
      });
      const req = { body: { country_code: 'IN', country_name: 'India', currency_code: 'INR' } };
      const res = mockRes();

      await addCountry(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('returns 400 on validation failure', async () => {
      countryServices.addCountryService.mockResolvedValue({
        success: false,
        error: 'Validation error',
      });
      const req = { body: {} };
      const res = mockRes();

      await addCountry(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateCountry', () => {
    test('returns 200 on update', async () => {
      countryServices.updateCountryService.mockResolvedValue({
        success: true,
        data: { id: 1 },
      });
      const req = { params: { id: 1 }, body: { country_name: 'India' } };
      const res = mockRes();

      await updateCountry(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getCountry', () => {
    test('returns 200 on fetch', async () => {
      countryServices.getSingleCountryService.mockResolvedValue({
        success: true,
        data: { id: 1 },
      });
      const req = { params: { id: 1 } };
      const res = mockRes();

      await getCountry(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getCountriesList', () => {
    test('returns 200 on list', async () => {
      countryServices.getCountriesListService.mockResolvedValue({
        success: true,
        data: [{ id: 1 }],
      });
      const req = { query: {} };
      const res = mockRes();

      await getCountriesList(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteCountry', () => {
    test('returns 200 on delete', async () => {
      countryServices.deleteCountryService.mockResolvedValue({
        success: true,
      });
      const req = { params: { id: 1 } };
      const res = mockRes();

      await deleteCountry(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
