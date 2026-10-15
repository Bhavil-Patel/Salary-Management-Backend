# 🤖 Intentional AI Prompting & Engineering Playbook: Salary Management Backend

This document details the intentional AI workflows, meta-prompts, system instructions, and engineering guardrails used to accelerate the design, implementation, and rigorous test coverage of the **Salary Management System Backend**.

---

## 1. AI Collaboration Philosophy & Guardrails

The goal of utilizing Agentic AI in this assessment was not blind code generation, but **accelerated architectural execution** paired with strict human-in-the-loop validation:

1. **Deterministic Correctness First**: Financial and payroll systems cannot tolerate approximate logic or floating-point drift. AI outputs were strictly verified against statutory formulas.
2. **Layered Separation of Concerns**: Enforced clean MVC/Service separation. AI was prohibited from mixing database queries into Express controllers or embedding business math into route handlers.
3. **No Phantom Dependencies**: Restricted the AI from pulling bloated external libraries (e.g., date-fns, lodash, big.js) when native Node.js and standard JavaScript idioms could accomplish the task cleanly and with zero overhead.
4. **Test-Driven Rigor**: Every generated module was paired with fast, deterministic Jest unit and integration tests (achieving 151 passing tests).

---

## 2. Structured Prompt Catalog & Iteration Trajectory

### 2.1 Prompt 1: Domain Modeling & Relational Schema Generation
*Objective*: Design a clean, 3NF-compliant relational database schema using Sequelize ORM with strict referential constraints, indexing, and soft-delete capabilities.

```text
PROMPT:
"Act as a Principal Database Architect. We are designing the backend for an enterprise Employee 
Salary Management system catering to 10,000 employees across multiple global jurisdictions.
Create Sequelize migration scripts and models for:
1. 'countries' (id, country_name, country_code [ISO 2], currency_code [ISO 4217])
2. 'departments' (id, department_name)
3. 'jobs' (id, job_title)
4. 'employees' (id, full_name, email [unique], job_id [FK], department_id [FK], country_id [FK], 
   salary [DECIMAL(14,2)], hire_date)
5. 'payrolls' (id, employee_id [FK], month, year, basic_salary, hra, conveyance_allowance, 
   medical_allowance, special_allowance, bonus, gross_salary, pf_deduction, professional_tax, 
   tds_tax, other_deductions, total_deductions, net_salary, payment_method, payment_date, 
   status ['PROCESSED', 'PAID'], remarks)
6. 'salary_revisions' (id, employee_id [FK], previous_salary, new_salary, increment_percentage, 
   effective_date, revision_type, remarks)

Strict Requirements:
- Use Sequelize 'paranoid: true' (deleted_at) across all tables to guarantee historical audit integrity.
- Add B-Tree indexes on all foreign keys.
- Add compound indexes on payrolls for ['month', 'year'] and ['status'].
- Provide exact model associations in models/index.js.
- Ensure decimal precision is DECIMAL(14, 2) to eliminate floating point issues."
```

*Verification & Human Refinement*:
- Verified that `ON DELETE RESTRICT` was applied to master records to prevent cascading employee deletion.
- Added compound index `['month', 'year']` to `payrolls` to ensure O(log N) lookup during batch generation.

---

### 2.2 Prompt 2: Statutory Payroll Calculation Engine
*Objective*: Build a pure, deterministic calculation engine in JavaScript that implements organizational compensation breakdown and statutory deductions.

```text
PROMPT:
"Write a pure JavaScript function 'calculateSalaryBreakdown(baseSalary, bonus = 0, customDeductions = 0)' 
for our payroll service.
Rules:
1. Earnings:
   - Basic Salary: 50% of Base Salary
   - HRA: 20% of Base Salary
   - Conveyance: 5% of Base Salary
   - Medical: 5% of Base Salary
   - Special Allowance: Remainder to ensure total matches base salary (Base - (Basic + HRA + Conveyance + Medical))
   - Gross Salary: Basic + HRA + Conveyance + Medical + Special + Bonus
2. Statutory Deductions:
   - PF: 12% of Basic Salary
   - Professional Tax (PT): Flat 200 if Base Salary > 15,000, else 0
   - TDS (Income Tax):
     * If annualized salary (base * 12) > 1,000,000: 10% of monthly gross
     * If annualized salary > 500,000: 5% of monthly gross
     * Otherwise: 0
   - Total Deductions: PF + PT + TDS + customDeductions
3. Net Salary: max(0, Gross Salary - Total Deductions)

Critical Requirement:
All intermediate and final values MUST be rounded to 2 decimal places using cent-rounding 
(Math.round(val * 100) / 100) to avoid IEEE 754 floating-point drift. Provide unit tests covering 
various salary bands (e.g. ₹12,000, ₹45,000, ₹1,20,000)."
```

*Verification & Human Refinement*:
- Verified special allowance math prevents rounding loss so that `Basic + HRA + Conveyance + Medical + Special === BaseSalary`.
- Added defensive check `Math.max(0, net_salary)` to safeguard against edge cases where custom deductions exceed earnings.

---

### 2.3 Prompt 3: Seeder Engine for 10,000 Employees
*Objective*: Generate a fast, memory-safe database seeder to populate 10,000 realistic employees across global countries, departments, and realistic salary bands.

```text
PROMPT:
"We need to seed exactly 10,000 employees into MySQL using Sequelize CLI.
Write 'seeders/20261013100149-seed-10000-employees.js'.
Constraints:
1. Scale: Exactly 10,000 rows.
2. Performance & Memory: Do not insert 10,000 rows in a single query (causes packet overflow) 
   and do not use a loop of 10,000 individual inserts (too slow). Use chunked batch inserts of 1,000 rows.
3. Realism:
   - Mix of realistic diverse first names and last names.
   - Unique generated emails (e.g. 'firstname.lastname.id@example.com').
   - Spread across existing departments (Engineering, Sales, Marketing, Finance, HR, Operations).
   - Spread across existing jobs (8 diverse roles).
   - Spread across countries (IN, US, GB, CA, AU) with realistic localized salary ranges.
   - Hire dates randomized between 2015-01-01 and 2026-10-13.
4. Down Migration: Cleanly soft-delete or remove the seeded records by matching the '@example.com' domain."
```

*Verification & Human Refinement*:
- Pre-fetched country, department, and job IDs into an in-memory `Map` lookup before the batch loop, avoiding 10,000 individual query lookups.
- Execution speed was clocked at **1.8 seconds** for the entire 10,000-row batch.

---

### 2.4 Prompt 4: Real-Time Executive Dashboard & Statistical Calculations
*Objective*: Implement executive compensation metrics (headcount, average, true median, min, max, and adaptive 6-bucket distribution histogram) capable of processing 10,000 records in sub-50ms.

```text
PROMPT:
"Implement 'src/dashboard/services/dashboardServices.js'.
The HR Manager needs to understand how the organization pays its people.
We need:
1. Total Headcount.
2. Average Salary (rounded).
3. True Median Salary (Must correctly handle odd and even array lengths).
4. Minimum & Maximum Salary.
5. Group breakdowns by Country, Department, and Job Role (showing headcount, avg, median, min, max).
6. Adaptive 6-bucket salary distribution histogram:
   - Determine dynamic bucket step size based on spread (max - min).
   - Generate human-readable bucket labels like '$10k - $25k', '$25k - $40k', ..., '$85k+'.
   - Count employees falling in each range.

Performance Note:
Fetch only required columns from the employees table. Do the sorting and grouping in memory 
using JavaScript Maps and O(N log N) sorting so the endpoint responds in under 50ms for 10,000 rows."
```

*Verification & Human Refinement*:
- Separated `getMedian` and `generateDistributionBuckets` into pure exported helper functions.
- Wrote dedicated unit tests for edge cases: empty array, single employee, identical min/max salaries, and extreme salary spreads.

---

### 2.5 Prompt 5: Comprehensive Unit & Integration Test Generation
*Objective*: Build a robust, deterministically passing test suite using Jest and Supertest with zero flaky tests.

```text
PROMPT:
"Generate Jest unit tests and Supertest integration tests for our backend modules:
1. 'tests/unit/salaryCalculations.test.js' - 100% test coverage of calculateSalaryBreakdown.
2. 'tests/unit/dashboardCalculations.test.js' - Median of odd/even, zero length, histogram buckets.
3. 'tests/unit/payrollServices.test.js' - Mock Sequelize models (Payroll, Employee) to test:
   - List fetching with pagination and summary aggregates.
   - Monthly batch generation with deduplication skipping.
   - Single creation, update, mark as paid, bulk pay, and soft delete.
4. 'tests/unit/employeesServices.test.js' - Onboarding validation, uniqueness check, update, soft delete.
5. 'tests/unit/salaryRevisionServices.test.js' - Appraisal calculation, percentage math, base salary sync.
6. 'tests/integration/apiRoutes.test.js' - Supertest HTTP tests for /api/employees, /api/payroll, 
   /api/dashboard, /api/salary-revisions verifying status codes 200, 201, 400, 404, 409.

Strict Rules:
- Tests must be completely deterministic and mock external database connections.
- Run in-band with '--runInBand' in under 5 seconds.
- No unhandled Promise rejections or hanging open handles."
```

*Verification & Human Refinement*:
- Executed `yarn test` to verify all 151 tests pass cleanly across 15 test suites in ~2.8 seconds.
- Verified test isolation so that database state in integration tests does not cross-contaminate unit suites.

---

## 3. Human-in-the-Loop Review & Engineering Standards

Throughout the AI-augmented development lifecycle, the following human oversight practices were strictly enforced:

| Area | Potential AI Risk | Human Engineering Action |
| :--- | :--- | :--- |
| **Monetary Math** | Standard `number` division causing `0.0000000001` drift. | Implemented mandatory cent-level rounding wrapper across all calculations. |
| **Batch Payroll** | Duplicate payroll records on accidental double-click. | Enforced an in-memory `Set` lookup of existing records for the `(month, year)` key before creating new entries. |
| **Appraisal Sync** | Inserting revision log without updating employee's base salary. | Coupled the revision write with an immediate update to `Employee.salary`. |
| **Data Integrity** | Deleting a department with 2,000 assigned employees. | Added foreign key constraints (`RESTRICT`) and explicit service-level pre-checks returning HTTP 409 Conflict. |
| **Performance** | Fetching all columns and associations for 10k employees on dashboard. | Reduced query to selective projection (`attributes: ['id', 'salary', 'country_id', ...]`). |
