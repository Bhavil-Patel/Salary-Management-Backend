# 🏗 System Architecture & Technical Diagrams: Salary Management Backend

This document details the architectural blueprints, component topologies, entity relationships, and runtime sequence interactions powering the **Salary Management System Backend**.

All diagrams are authored in GitHub-compliant **Mermaid** syntax for dynamic visualization and long-term version control.

---

## 1. High-Level System Topology

The system uses a decoupled client-server architecture. The backend exposes stateless RESTful APIs over HTTP/JSON consumed by a modern Single Page Application (SPA), backed by a relational MySQL 8 database.

```mermaid
graph TB
    subgraph Client_Tier["Client Presentation Layer (React / Next.js)"]
        UI["HR Manager Web Dashboard<br/>- Employee Directory<br/>- Payroll Generation & Reconciliation<br/>- Appraisals & Salary Revisions<br/>- Statistical Analytics & Charts"]
    end

    subgraph API_Gateway["Node.js / Express 5 API Server (Port 5000)"]
        Cors["CORS & Body Parser Middleware"]
        Router["Express REST API Router"]
        
        subgraph Domain_Controllers["Domain Controllers"]
            EmpCtrl["Employees Controller"]
            PayCtrl["Payroll Controller"]
            RevCtrl["Salary Revision Controller"]
            DashCtrl["Dashboard Controller"]
            MetaCtrl["Master Data Controllers<br/>(Country, Dept, Job)"]
        end
        
        subgraph Domain_Services["Domain Service Layer (Pure Business Logic)"]
            EmpSvc["Employee Service"]
            PaySvc["Payroll Calculation Engine"]
            RevSvc["Revision & Sync Service"]
            DashSvc["Statistical Engine (Median/Histogram)"]
            MetaSvc["Master Data Service"]
        end

        ORM["Sequelize ORM v6<br/>(Connection Pool, Query Builder, Model Associations)"]
    end

    subgraph Data_Tier["Relational Persistence Tier"]
        DB[(MySQL 8.0+ Database)]
        Tables["Tables: employees, payrolls, salary_revisions,<br/>departments, jobs, countries"]
        Indexes["B-Tree Indexes:<br/>- Foreign Keys (dept_id, job_id, country_id)<br/>- Compound: (month, year)<br/>- Status: (status)"]
    end

    subgraph Batch_Seeder["Data Initialization Engine"]
        Seeder["10,000 Employee Bulk Seeder<br/>(Batch Chunking: 1,000 rows/batch)"]
    end

    UI -->|"HTTP / REST API (JSON)"| Cors
    Cors --> Router
    Router --> EmpCtrl & PayCtrl & RevCtrl & DashCtrl & MetaCtrl
    EmpCtrl --> EmpSvc
    PayCtrl --> PaySvc
    RevCtrl --> RevSvc
    DashCtrl --> DashSvc
    MetaCtrl --> MetaSvc
    EmpSvc & PaySvc & RevSvc & DashSvc & MetaSvc --> ORM
    ORM -->|"mysql2 Driver Pool"| DB
    DB --- Tables
    Tables --- Indexes
    Seeder -->|"queryInterface.bulkInsert"| DB
```

---

## 2. Layered Clean Architecture (Module Internals)

Every domain follows a strict unidirectional data flow: **Route ➔ Controller ➔ Service ➔ Model ➔ Database**.

```mermaid
flowchart LR
    subgraph Presentation["Route & Controller Tier"]
        R[route.js] -->|HTTP Request| C[controller.js]
        C -->|Unwrap params/query/body| C
    end

    subgraph Business["Domain Service Tier (Business Logic)"]
        C -->|Call Service Method| S[services.js]
        S -->|Execute Pure Math & Rules| Logic["Salary Breakdown Engine<br/>Median & Histogram Bucketing<br/>Idempotency Verification"]
    end

    subgraph Persistence["Data Access Tier"]
        S -->|Sequelize ORM Query| M[models/index.js]
        M -->|SQL Query| DB[(MySQL Server)]
    end

    DB -->|Result Set| M
    M -->|Plain Objects / Models| S
    S -->|Standard Response Envelope| C
    C -->|HTTP 200/201/400/404/500| R
```

---

## 3. Entity-Relationship Diagram (ERD)

The relational schema is normalized to 3NF, enforcing referential integrity while providing soft-delete auditability across all tables.

```mermaid
erDiagram
    COUNTRIES ||--o{ EMPLOYEES : "employs"
    DEPARTMENTS ||--o{ EMPLOYEES : "assigns"
    JOBS ||--o{ EMPLOYEES : "categorizes"
    EMPLOYEES ||--o{ PAYROLLS : "receives"
    EMPLOYEES ||--o{ SALARY_REVISIONS : "granted"

    COUNTRIES {
        int id PK "auto_increment"
        varchar country_name "not null"
        varchar country_code "unique, 2 chars (ISO-2)"
        varchar currency_code "3 chars (ISO-4217)"
        datetime created_at
        datetime updated_at
        datetime deleted_at "paranoid soft-delete"
    }

    DEPARTMENTS {
        int id PK "auto_increment"
        varchar department_name "unique, not null"
        datetime created_at
        datetime updated_at
        datetime deleted_at "paranoid soft-delete"
    }

    JOBS {
        int id PK "auto_increment"
        varchar job_title "unique, not null"
        datetime created_at
        datetime updated_at
        datetime deleted_at "paranoid soft-delete"
    }

    EMPLOYEES {
        int id PK "auto_increment"
        varchar full_name "not null, max 150"
        varchar email "unique, not null, max 255"
        int job_id FK "references jobs(id)"
        int department_id FK "references departments(id)"
        int country_id FK "references countries(id)"
        decimal salary "14, 2, not null"
        date hire_date "not null"
        datetime created_at
        datetime updated_at
        datetime deleted_at "paranoid soft-delete"
    }

    PAYROLLS {
        int id PK "auto_increment"
        int employee_id FK "references employees(id)"
        int month "1 to 12"
        int year "e.g. 2026"
        decimal basic_salary "14, 2 (50%)"
        decimal hra "14, 2 (20%)"
        decimal conveyance_allowance "14, 2 (5%)"
        decimal medical_allowance "14, 2 (5%)"
        decimal special_allowance "14, 2 (20%)"
        decimal bonus "14, 2"
        decimal gross_salary "14, 2 (total earnings)"
        decimal pf_deduction "14, 2 (12% of basic)"
        decimal professional_tax "14, 2 (₹200 / 0)"
        decimal tds_tax "14, 2 (5% or 10% tiered)"
        decimal other_deductions "14, 2"
        decimal total_deductions "14, 2"
        decimal net_salary "14, 2 (take-home)"
        varchar payment_method "e.g. BANK_TRANSFER"
        date payment_date "nullable"
        varchar status "PROCESSED or PAID"
        text remarks "nullable"
        datetime created_at
        datetime updated_at
        datetime deleted_at "paranoid soft-delete"
    }

    SALARY_REVISIONS {
        int id PK "auto_increment"
        int employee_id FK "references employees(id)"
        decimal previous_salary "14, 2"
        decimal new_salary "14, 2"
        decimal increment_percentage "6, 2"
        date effective_date "not null"
        varchar revision_type "e.g. Annual Appraisal"
        text remarks "nullable"
        datetime created_at
        datetime updated_at
        datetime deleted_at "paranoid soft-delete"
    }
```

---

## 4. Sequence Diagram: Monthly Batch Payroll Generation

Demonstrates how the HR Manager triggers a monthly payroll run for 10,000 employees with deduplication and bulk generation.

```mermaid
sequenceDiagram
    autonumber
    actor HR as HR Manager (Frontend)
    participant Ctrl as Payroll Controller
    participant Svc as Payroll Service
    participant Engine as Salary Breakdown Engine
    participant DB as MySQL Database

    HR->>Ctrl: POST /api/payroll/generate { month: 10, year: 2026, department_id: "ALL" }
    Ctrl->>Svc: generateMonthlyPayrollService({ month: 10, year: 2026 })
    
    Note over Svc,DB: 1. Fetch eligible active employees
    Svc->>DB: Employee.findAll({ where: { deleted_at: null } })
    DB-->>Svc: Returns 10,000 Employee instances
    
    Note over Svc,DB: 2. Query existing payrolls to guarantee idempotency
    Svc->>DB: Payroll.findAll({ where: { month: 10, year: 2026, employee_id: [...] }, attributes: ['employee_id'] })
    DB-->>Svc: Returns existing payroll records (if any)
    
    Note over Svc,Engine: 3. Filter out processed employees using Hash Set (O(1))
    loop For each un-processed employee
        Svc->>Engine: calculateSalaryBreakdown(emp.salary, bonus, 0)
        Engine-->>Svc: Computed { basic, hra, conveyance, medical, special, pf, pt, tds, net }
        Svc->>Svc: Push to batch insert buffer
    end

    Note over Svc,DB: 4. Perform single bulk insert
    Svc->>DB: Payroll.bulkCreate(newRecords)
    DB-->>Svc: Insert confirmation
    
    Svc-->>Ctrl: { success: true, processedCount: 10000, skippedCount: 0 }
    Ctrl-->>HR: HTTP 201 Created with Batch Summary JSON
```

---

## 5. Sequence Diagram: Salary Revision & Automatic Base Salary Synchronization

Shows how an appraisal record is logged and immediately synchronizes the live employee base salary.

```mermaid
sequenceDiagram
    autonumber
    actor HR as HR Manager
    participant Ctrl as Salary Revision Controller
    participant Svc as Salary Revision Service
    participant DB as MySQL Database

    HR->>Ctrl: POST /api/salary-revisions/add<br/>{ employee_id: 42, new_salary: 85000, effective_date: "2026-10-01", revision_type: "Annual Appraisal" }
    Ctrl->>Svc: addSalaryRevisionService(payload)
    
    Svc->>DB: Employee.findByPk(42)
    DB-->>Svc: Employee record (current salary: 75000)
    
    Note over Svc: Calculate increment percentage:<br/>((85000 - 75000) / 75000) * 100 = 13.33%
    
    Note over Svc,DB: Transactional Write & Base Sync
    Svc->>DB: SalaryRevision.create({ employee_id: 42, previous: 75000, new: 85000, increment: 13.33% })
    Svc->>DB: Employee.update({ salary: 85000 }, { where: { id: 42 } })
    DB-->>Svc: Write confirmations
    
    Svc-->>Ctrl: { success: true, data: { revision, updatedEmployee } }
    Ctrl-->>HR: HTTP 201 Created (Instant visual reflection in UI)
```

---

## 6. Sequence Diagram: Real-Time Executive Dashboard Insights

Illustrates how the statistical engine calculates headcount, mean, true median, and adaptive histogram buckets for 10,000 employees in sub-50 milliseconds.

```mermaid
sequenceDiagram
    autonumber
    actor HR as HR Manager
    participant Ctrl as Dashboard Controller
    participant Svc as Dashboard Service
    participant DB as MySQL Database

    HR->>Ctrl: GET /api/dashboard
    Ctrl->>Svc: getDashboardInsightsService()
    
    Note over Svc,DB: Selective projection of required columns only
    Svc->>DB: Employee.findAll({<br/>  attributes: ['id', 'salary', 'country_id', 'department_id', 'job_id'],<br/>  include: [Country, Department, Job]<br/>})
    DB-->>Svc: 10,000 Employee records
    
    Note over Svc: In-Memory O(N log N) Statistical Computations:<br/>1. Map and sort salaries: [15000, 16200, ..., 80000]<br/>2. Mean = Sum / 10000<br/>3. Median = (salaries[4999] + salaries[5000]) / 2<br/>4. Group by Country, Dept, Job<br/>5. Calculate adaptive 6-bucket distribution
    
    Svc-->>Ctrl: Structured Insights Object:<br/>{ totalHeadcount, avgSalary, medianSalary, minSalary, maxSalary, byCountry, byDepartment, byJobTitle, distribution }
    Ctrl-->>HR: HTTP 200 OK (Rendered as Interactive Charts in UI)
```

---

## 7. State Transition Diagram: Payroll Record Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PROCESSED: Monthly Batch Generation / Manual Creation
    
    PROCESSED --> PAID: markPayrollPaid(id)<br/>[sets payment_date, payment_method]
    PROCESSED --> PAID: bulkMarkPaid({ month, year })<br/>[mass reconciliation]
    
    PROCESSED --> DELETED: Soft Delete (Correction)
    PAID --> DELETED: Soft Delete (Paranoid audit preservation)
    
    DELETED --> [*]
```
