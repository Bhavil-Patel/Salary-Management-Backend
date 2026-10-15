# 📁 System Artifacts Catalog: Salary Management Backend

This directory contains the engineering artifacts, design notes, architectural diagrams, AI collaboration workflows, trade-off analyses, and performance benchmarks for the **Salary Management System Backend**.

These documents provide complete transparency into the engineering decisions, product thinking, and architectural rigor underpinning the solution.

---

## 📚 Artifact Index & Navigation

| Document | Primary Focus | Key Content Covered |
| :--- | :--- | :--- |
| [**REQUIREMENTS_DOCUMENT.md**](./REQUIREMENTS_DOCUMENT.md) | **Product Requirements & Scope Framing** | • HR Manager User Persona & pain points<br/>• In-scope feature specifications (FR-1 through FR-5)<br/>• Explicitly out-of-scope features with engineering & business reasoning<br/>• Non-Functional Requirements (NFR) |
| [**PLANNING_AND_DESIGN_NOTES.md**](./PLANNING_AND_DESIGN_NOTES.md) | **System Architecture & Domain Invariants** | • Layered MVC/Service architecture & separation of concerns<br/>• Relational data models, foreign keys & soft-delete strategy<br/>• Statutory payroll arithmetic & cent-rounding precision rules<br/>• Salary revision & base salary live sync state machine |
| [**ARCHITECTURE_DIAGRAMS.md**](./ARCHITECTURE_DIAGRAMS.md) | **Technical Diagrams & Visual Blueprints** | • High-level system topology & network boundaries (Mermaid)<br/>• Layered clean architecture dataflow diagram<br/>• Full 3NF Entity-Relationship Diagram (ERD)<br/>• Batch payroll sequence & salary revision sequence diagrams<br/>• Payroll lifecycle state machine |
| [**AI_PROMPTS_AND_INSTRUCTIONS.md**](./AI_PROMPTS_AND_INSTRUCTIONS.md) | **Agentic AI Methodology & Prompts** | • Intentional AI prompting workflow & human-in-the-loop guardrails<br/>• Prompt catalog: ORM schema design, payroll math, seeder, tests<br/>• Risk mitigation (floating point drift, duplicate batch payroll, phantom packages)<br/>• 151 deterministic Jest unit & integration test strategies |
| [**TRADE_OFF_EXPLANATIONS.md**](./TRADE_OFF_EXPLANATIONS.md) | **Architectural Decisions & Trade-Offs** | • MySQL 8 (ACID) vs. MongoDB/NoSQL<br/>• Sequelize ORM vs. Raw SQL vs. Prisma<br/>• In-memory V8 statistical sorting (< 5ms) vs. DB stored procedures<br/>• Synchronous batching vs. Redis/BullMQ asynchronous job queues<br/>• Soft deletions (`paranoid: true`) vs. physical deletes<br/>• `DECIMAL(14,2)` arithmetic vs. floating point |
| [**PERFORMANCE_CONSIDERATIONS.md**](./PERFORMANCE_CONSIDERATIONS.md) | **10,000 Employees Scale Engineering** | • B-Tree indexing strategy & compound index on `(month, year)`<br/>• Seeder batch chunking (`BATCH_SIZE = 1000`) finishing in ~1.8s<br/>• Sub-50ms dashboard insights over 10,000 records<br/>• Empirical latency benchmark table for all REST endpoints<br/>• Scaling roadmap for 100,000+ employees |

---

## ⚡ Quick Verification Commands

To verify the test suite and database health:

```bash
# 1. Run all 151 Unit and Integration Tests (completes in ~2.5s)
yarn test

# 2. Run Database Migrations
yarn db:migrate

# 3. Seed 10,000 Realistic Employees across 5 Countries
yarn db:seed

# 4. Launch Development API Server
yarn dev
```
