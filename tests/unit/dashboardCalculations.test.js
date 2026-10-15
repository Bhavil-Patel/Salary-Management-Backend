const { getMedian, generateDistributionBuckets } = require('../../src/dashboard/services/dashboardServices');

describe('Dashboard Analytics & Statistical Calculations', () => {
  describe('getMedian', () => {
    test('returns 0 for an empty array', () => {
      expect(getMedian([])).toBe(0);
    });

    test('returns the single element for an array with 1 item', () => {
      expect(getMedian([45000])).toBe(45000);
    });

    test('returns the exact middle value for an odd-length sorted array', () => {
      // 5 elements -> index 2 is middle
      const oddList = [30000, 40000, 50000, 70000, 90000];
      expect(getMedian(oddList)).toBe(50000);
    });

    test('returns the rounded average of the two middle values for an even-length sorted array', () => {
      // 4 elements -> mid indices 1 and 2: (40000 + 60000) / 2 = 50000
      const evenList = [20000, 40000, 60000, 80000];
      expect(getMedian(evenList)).toBe(50000);

      // Mid indices: (30000 + 45000) / 2 = 37500
      const evenList2 = [10000, 30000, 45000, 90000];
      expect(getMedian(evenList2)).toBe(37500);
    });
  });

  describe('generateDistributionBuckets', () => {
    test('returns an empty array when salaries array is empty', () => {
      expect(generateDistributionBuckets([], 0, 0)).toEqual([]);
    });

    test('returns a single bucket when minSalary equals maxSalary', () => {
      const salaries = [50000, 50000, 50000];
      const result = generateDistributionBuckets(salaries, 50000, 50000);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        range: '$50k',
        count: 3,
      });
    });

    test('generates exactly 6 buckets for distributed salary range', () => {
      const salaries = [20000, 30000, 40000, 50000, 60000, 70000, 80000, 100000, 120000];
      const minSalary = 20000;
      const maxSalary = 120000;

      const buckets = generateDistributionBuckets(salaries, minSalary, maxSalary);

      expect(buckets).toHaveLength(6);

      // All elements should be counted across the buckets
      const totalCount = buckets.reduce((acc, b) => acc + b.count, 0);
      expect(totalCount).toBe(salaries.length);

      // The last bucket represents infinity with a '+' label
      const lastBucket = buckets[5];
      expect(lastBucket.range).toContain('+');
    });

    test('scales step sizes properly for narrow and wide salary ranges', () => {
      // Narrow range: rawStep <= 5000
      const narrowSalaries = [10000, 12000, 15000, 18000, 20000];
      const narrowBuckets = generateDistributionBuckets(narrowSalaries, 10000, 20000);
      expect(narrowBuckets).toHaveLength(6);

      // Wide range: rawStep > 50000
      const wideSalaries = [50000, 150000, 300000, 500000, 1000000];
      const wideBuckets = generateDistributionBuckets(wideSalaries, 50000, 1000000);
      expect(wideBuckets).toHaveLength(6);
      expect(wideBuckets.reduce((acc, b) => acc + b.count, 0)).toBe(wideSalaries.length);
    });
  });
});
