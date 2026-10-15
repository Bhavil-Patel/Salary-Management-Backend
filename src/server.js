const express = require("express");
require("dotenv").config({ quiet: true });
const app = express();
const PORT = process.env.PORT || 5000;
const employeesRouter = require('./employees/route');
const jobsRouter = require('./jobs/route');
const departmentRouter = require('./department/route');
const countryRouter = require('./country/route');
const dashboardRouter = require('./dashboard/route');
const payrollRouter = require('./payroll/route');
const salaryRevisionRouter = require('./salaryRevision/route');

app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use('/api/employees', employeesRouter);
app.use('/api/job', jobsRouter);
app.use('/api/department', departmentRouter);
app.use('/api/country', countryRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/salary-revisions', salaryRevisionRouter);

app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is running successfully!",
    });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
    });
}

module.exports = app;