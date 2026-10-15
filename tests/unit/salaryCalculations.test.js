const { calculateSalaryBreakdown } = require('../../src/payroll/services/payrollServices');

describe('Core Salary & Statutory Deduction Calculations', () => {
  describe('Gross Salary Breakdown Components', () => {
    test('calculates basic, HRA, conveyance, medical, and special allowance accurately for base salary 100,000', () => {
      const breakdown = calculateSalaryBreakdown(100000);

      // Basic = 50%
      expect(breakdown.basic_salary).toBe(50000);
      // HRA = 20%
      expect(breakdown.hra).toBe(20000);
      // Conveyance = 5%
      expect(breakdown.conveyance_allowance).toBe(5000);
      // Medical = 5%
      expect(breakdown.medical_allowance).toBe(5000);
      // Special allowance = remaining (100k - (50k + 20k + 5k + 5k) = 20k)
      expect(breakdown.special_allowance).toBe(20000);
      // Sum of components equals base salary when bonus is 0
      const componentSum =
        breakdown.basic_salary +
        breakdown.hra +
        breakdown.conveyance_allowance +
        breakdown.medical_allowance +
        breakdown.special_allowance;
      expect(componentSum).toBe(100000);
      expect(breakdown.gross_salary).toBe(100000);
    });

    test('adds performance bonus to gross salary', () => {
      const baseSalary = 60000;
      const bonus = 10000;
      const breakdown = calculateSalaryBreakdown(baseSalary, bonus);

      expect(breakdown.bonus).toBe(10000);
      expect(breakdown.gross_salary).toBe(70000);
    });

    test('handles zero base salary cleanly', () => {
      const breakdown = calculateSalaryBreakdown(0);

      expect(breakdown.basic_salary).toBe(0);
      expect(breakdown.hra).toBe(0);
      expect(breakdown.conveyance_allowance).toBe(0);
      expect(breakdown.medical_allowance).toBe(0);
      expect(breakdown.special_allowance).toBe(0);
      expect(breakdown.gross_salary).toBe(0);
      expect(breakdown.total_deductions).toBe(0);
      expect(breakdown.net_salary).toBe(0);
    });
  });

  describe('Statutory Deductions (PF, PT, TDS)', () => {
    test('calculates Provident Fund (PF) as exactly 12% of basic salary', () => {
      const salary = 80000;
      const breakdown = calculateSalaryBreakdown(salary);

      // Basic = 40,000 -> PF = 12% of 40,000 = 4,800
      expect(breakdown.basic_salary).toBe(40000);
      expect(breakdown.pf_deduction).toBe(4800);
    });

    test('calculates Professional Tax (PT): ₹0 when monthly salary <= 15,000', () => {
      const breakdown15k = calculateSalaryBreakdown(15000);
      expect(breakdown15k.professional_tax).toBe(0);

      const breakdown10k = calculateSalaryBreakdown(10000);
      expect(breakdown10k.professional_tax).toBe(0);
    });

    test('calculates Professional Tax (PT): ₹200 when monthly salary > 15,000', () => {
      const breakdown15001 = calculateSalaryBreakdown(15001);
      expect(breakdown15001.professional_tax).toBe(200);

      const breakdown50k = calculateSalaryBreakdown(50000);
      expect(breakdown50k.professional_tax).toBe(200);
    });

    test('TDS is 0% when estimated annual salary <= 500,000 (monthly <= 41,666.66)', () => {
      const breakdown = calculateSalaryBreakdown(40000); // 40k * 12 = 480k <= 500k
      expect(breakdown.tds_tax).toBe(0);
    });

    test('TDS is 5% of gross salary when annual salary > 500,000 and <= 1,000,000', () => {
      const salary = 60000; // 60k * 12 = 720k (between 500k and 1M)
      const bonus = 5000;
      const breakdown = calculateSalaryBreakdown(salary, bonus);

      // Gross = 65,000 -> TDS = 5% of 65,000 = 3,250
      expect(breakdown.gross_salary).toBe(65000);
      expect(breakdown.tds_tax).toBe(3250);
    });

    test('TDS is 10% of gross salary when annual salary > 1,000,000 (monthly > 83,333.33)', () => {
      const salary = 100000; // 100k * 12 = 1.2M > 1M
      const breakdown = calculateSalaryBreakdown(salary);

      // Gross = 100,000 -> TDS = 10% of 100,000 = 10,000
      expect(breakdown.gross_salary).toBe(100000);
      expect(breakdown.tds_tax).toBe(10000);
    });

    test('includes custom/other deductions in total deductions', () => {
      const salary = 50000;
      const customDeductions = 1500;
      const breakdown = calculateSalaryBreakdown(salary, 0, customDeductions);

      expect(breakdown.other_deductions).toBe(1500);
      // Basic = 25000 -> PF = 3000, PT = 200, TDS = 50k*12=600k -> 5% of 50k = 2500, Other = 1500
      // Total = 3000 + 200 + 2500 + 1500 = 7200
      expect(breakdown.total_deductions).toBe(7200);
    });
  });

  describe('Net Take-Home Salary', () => {
    test('computes Net Salary as Gross Salary minus Total Deductions', () => {
      const salary = 120000;
      const breakdown = calculateSalaryBreakdown(salary);

      const expectedNet = breakdown.gross_salary - breakdown.total_deductions;
      expect(breakdown.net_salary).toBe(expectedNet);
      expect(breakdown.net_salary).toBeGreaterThan(0);
    });

    test('clamps Net Salary to 0 if total deductions exceed gross salary', () => {
      const salary = 10000;
      const hugeCustomDeduction = 50000;
      const breakdown = calculateSalaryBreakdown(salary, 0, hugeCustomDeduction);

      expect(breakdown.net_salary).toBe(0);
    });

    test('accurately maintains 2 decimal precision without floating point drift', () => {
      const breakdown = calculateSalaryBreakdown(33333.33);

      expect(breakdown.basic_salary).toBe(16666.67);
      expect(breakdown.hra).toBe(6666.67);
      expect(breakdown.conveyance_allowance).toBe(1666.67);
      expect(breakdown.medical_allowance).toBe(1666.67);
      expect(Number(breakdown.basic_salary.toFixed(2))).toBe(breakdown.basic_salary);
      expect(Number(breakdown.pf_deduction.toFixed(2))).toBe(breakdown.pf_deduction);
      expect(Number(breakdown.total_deductions.toFixed(2))).toBe(breakdown.total_deductions);
      expect(Number(breakdown.net_salary.toFixed(2))).toBe(breakdown.net_salary);
    });
  });
});
