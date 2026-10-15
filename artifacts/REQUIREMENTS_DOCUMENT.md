# 📋 Product Requirements Document (PRD): Employee Salary Management System

**Document Version**: 1.0.0  
**Target Organization Scale**: 10,000 Employees across Multi-Country Operations  
**Primary User Persona**: Human Resources (HR) Manager  
**System**: Backend REST API & Compensation Engine  

---

## 1. Problem Framing & Opportunity

### 1.1 Current State
The organization currently employs **10,000 individuals** across multiple countries (India, United States, United Kingdom, Canada, Australia). Compensation tracking, monthly payslip calculation, tax deductions, and annual salary increments are managed entirely through **fragmented Excel spreadsheets**.

### 1.2 Pain Points
1. **Error-Prone Manual Calculations**: Human error in statutory deduction formulas (Provident Fund, Professional Tax, TDS) causes payroll discrepancies.
2. **Audit & Compliance Risk**: Lack of an immutable audit trail when salaries are appraised or updated.
3. **No Executive Visibility**: Answering strategic questions about organizational compensation (e.g., *"What is our median salary by department?"* or *"What is our total gross liability for this month?"*) takes days of manual spreadsheet compilation.
4. **Performance Bottleneck**: Excel becomes sluggish, unstable, and prone to corruption when handling 10,000+ rows with inter-sheet formulas.

### 1.3 Core Product Goal
Deliver an enterprise-grade, high-performance web software backend that enables the HR Manager to:
- Maintain a **Single Source of Truth (SSOT)** for 10,000 employees with master classification (Departments, Job Titles, Countries).
- Automate **Monthly Batch Payroll Processing** with deterministic statutory calculations.
- Track **Salary Revisions & Appraisals** with automated live base-salary synchronization.
- Gain instant **Executive Dashboard Analytics** (headcount, mean, median, min, max, salary distributions) in sub-100ms response times.

---

## 2. User Persona

### Primary Persona: HR Manager (Sarah)
- **Role**: Head of Global People Operations & Compensation.
- **Key Responsibilities**:
  - Review and onboard new employees into appropriate country salary bands.
  - Run the monthly payroll for the entire organization (10,000 employees) or specific departments with a single click.
  - Review and reconcile payouts, transitioning payroll entries from `PROCESSED` to `PAID`.
  - Process annual performance increments and promotions with full historical logging.
  - Report compensation statistics to the CFO and executive leadership.
- **Needs**: Fast, deterministic calculations, zero data loss, clear audit history, and sub-second analytics.

---

## 3. Scope & Feature Specifications

### 3.1 In-Scope Features

#### Feature 1: Employee Master Directory & Lifecycle Management
- **FR-1.1**: Add, update, view, and list employees with validation on mandatory fields (full name, email, job ID, department ID, country ID, salary, hire date).
- **FR-1.2**: Active email uniqueness enforcement.
- **FR-1.3**: Server-side pagination (`page`, `limit`), case-insensitive search by name or email, and filtering by department and job role.
- **FR-1.4**: Eager loading of associated Country, Department, and Job records.
- **FR-1.5**: Soft-deletion (`paranoid: true`) with `deleted_at` timestamp to protect historical payroll associations.

#### Feature 2: Automated Monthly Payroll Engine
- **FR-2.1 Dynamic Compensation Breakdown**:
  - Basic Salary ($50\%$), HRA ($20\%$), Conveyance ($5\%$), Medical ($5\%$), Special Allowance ($20\%$ balancing figure).
  - Statutory Deductions: Provident Fund ($12\%$ of Basic), Professional Tax (₹200 for base $> ₹15,000$), TDS ($5\%$ or $10\%$ based on annualized salary slabs).
  - Cent-level deterministic rounding to prevent floating-point drift.
- **FR-2.2 Batch Monthly Generation**: One-click generation for all active employees or by department for any month/year.
- **FR-2.3 Idempotency Guarantee**: Automatically skip employees who already have a payroll record for the requested period.
- **FR-2.4 Manual Adjustments**: Ability to create single custom payroll records with specific bonus and custom deduction amounts.
- **FR-2.5 Payout Reconciliation**: Transition records from `PROCESSED` to `PAID` with payment date and method (`BANK_TRANSFER`).
- **FR-2.6 Bulk Payment**: Bulk mark all unpaid payroll records in a period as `PAID`.
- **FR-2.7 Aggregate Financial Totals**: Every payroll list response returns real-time totals (`totalGross`, `totalDeductions`, `totalNet`, `paidCount`, `processedCount`).

#### Feature 3: Salary Revisions & Appraisal Tracking
- **FR-3.1**: Log historical appraisals with previous salary, new salary, increment percentage, effective date, revision type, and remarks.
- **FR-3.2 Automatic Percentage Math**: Compute $((\text{New} - \text{Previous}) / \text{Previous}) \times 100$.
- **FR-3.3 Live Synchronization**: Creating a salary revision atomically updates the employee's active base salary in the `employees` table.
- **FR-3.4 Audit Trail**: Paginated revision history accessible per employee or across the organization.

#### Feature 4: Executive Compensation Analytics & Dashboard
- **FR-4.1 Real-Time Org Metrics**: Total Headcount, Mean Salary, True Median Salary (handling odd/even dataset sizes), Minimum and Maximum Salary.
- **FR-4.2 Grouped Dimensional Analytics**: Headcount, mean, median, min, max broken down by:
  - Country
  - Department
  - Job Title
- **FR-4.3 Adaptive 6-Bucket Distribution Histogram**: Dynamically scaled salary distribution histogram.

#### Feature 5: Organizational Master Data Management
- Full CRUD management for Departments, Job Roles, and Countries with ISO codes and currency symbols.
- Referential constraints preventing deletion of master entities if active employees are assigned.

#### Feature 6: High-Scale Dataset Seeding (10,000 Employees)
- Bundled database seeder populating **10,000 realistic employees** across realistic global salary bands for stress testing.

---

## 4. Deliberately Out-of-Scope (With Engineering & Business Rationale)

To maintain focus on core compensation mechanics, data integrity, and deterministic testing, the following features are deliberately deferred to future iterations:

| Deferred Feature | Rationale for Omission in Current Release | Future Roadmap |
| :--- | :--- | :--- |
| **Direct Bank Payment Gateway APIs (e.g. Stripe, RazorpayX, Wise)** | Integrating third-party banking APIs introduces external network dependencies, sandbox credential requirements, and compliance overhead (PCI-DSS/banking KYC). The current system models payment reconciliation (`PROCESSED` ➔ `PAID`) via clean status transitions. | Phase 2 (Async Worker Integration) |
| **Complex Multi-Jurisdiction Statutory Tax Engine (e.g. US 401k, UK PAYE, AU Superannuation)** | True multi-national payroll compliance requires country-specific tax rules that change yearly. We implemented standardized, representative statutory rules (PF, PT, TDS) to demonstrate algorithmic rigor without embedding thousands of lines of external tax code. | Phase 3 (Plug-in Tax Strategy Pattern) |
| **Employee Self-Service Portal & Login (SSO / JWT)** | The assessment's user persona is strictly the **HR Manager**. Building employee logins, role-based access control (RBAC), and forgot-password flows adds auth boilerplate without advancing the core salary management objectives. | Phase 2 (RBAC & Auth0 / Okta SSO) |
| **Automated PDF Payslip Generation & Email Dispatch** | Generating 10,000 PDFs in Node.js requires heavy canvas/puppeteer libraries. The backend exposes complete payslip JSON payloads; PDF rendering is best deferred to client-side printing or an asynchronous worker queue. | Phase 2 (Headless PDF Service) |
| **Distributed Asynchronous Job Queue (BullMQ / Redis)** | Generating 10,000 records in-process takes ~1.2s. Adding Redis and worker containers increases infrastructure complexity without necessity at this scale. | Phase 3 (When scaling beyond 100k rows) |

---

## 5. Non-Functional Requirements (NFR)

1. **Performance**:
   - Paginated listings: $< 60\text{ ms}$ response time.
   - Dashboard insights over 10,000 rows: $< 50\text{ ms}$ response time.
   - Batch payroll generation for 10,000 employees: $< 2\text{ seconds}$.
2. **Data Consistency**:
   - Foreign key integrity enforced via relational constraints (`ON DELETE RESTRICT`).
   - Soft deletes (`paranoid: true`) across all tables to guarantee auditability.
   - Financial arithmetic rounded to 2 decimal places to avoid IEEE 754 precision drift.
3. **Reliability & Testability**:
   - 100% deterministic unit and integration test suite passing in $< 5\text{ seconds}$.
   - Standardized JSON API envelope across all responses (`success`, `message`, `data`, `pagination`, `error`).
4. **Security**:
   - Parameterized SQL queries via Sequelize ORM to eliminate SQL injection.
   - Secrets and connection credentials managed strictly via `.env`.
