const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const employeesRouter = require('./employees/route');
app.use('/api/employees', employeesRouter);

app.get("/api", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is running successfully!",
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});