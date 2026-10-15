const db = require('../../models');

describe('Database Models & Associations', () => {
  test('exports sequelize instance and all entity models', () => {
    expect(db.sequelize).toBeDefined();
    expect(db.Sequelize).toBeDefined();

    expect(db.Country).toBeDefined();
    expect(db.Department).toBeDefined();
    expect(db.Employee).toBeDefined();
    expect(db.Job).toBeDefined();
    expect(db.Payroll).toBeDefined();
    expect(db.SalaryRevision).toBeDefined();
  });

  test('configures associations correctly on Employee model', () => {
    const associations = db.Employee.associations;

    expect(associations.country).toBeDefined();
    expect(associations.department).toBeDefined();
    expect(associations.job).toBeDefined();
    expect(associations.payrolls).toBeDefined();
    expect(associations.salary_revisions).toBeDefined();
  });

  test('configures associations correctly on Payroll model', () => {
    const associations = db.Payroll.associations;

    expect(associations.employee).toBeDefined();
  });

  test('configures associations correctly on SalaryRevision model', () => {
    const associations = db.SalaryRevision.associations;

    expect(associations.employee).toBeDefined();
  });

  test('configures reverse associations from Master Data models to Employee', () => {
    expect(db.Country.associations.employees).toBeDefined();
    expect(db.Department.associations.employees).toBeDefined();
    expect(db.Job.associations.employees).toBeDefined();
  });
});
