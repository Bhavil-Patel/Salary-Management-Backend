const { Router } = require("express");
const { addEmployee, updateEmployee, getEmployee, getEmployeesList, deleteEmployee } = require("./controllers/employees");
const { getDashboardInsights } = require("../dashboard/controllers/dashboard");
const router = Router();

router.post("/add", addEmployee);
router.put("/update", updateEmployee);
router.get("/:employee_id", getEmployee);
router.get("/", getEmployeesList);
router.delete("/:employee_id", deleteEmployee);
router.get("/insights", getDashboardInsights);

module.exports = router;