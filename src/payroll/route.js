const express = require("express");
const router = express.Router();
const { getPayrollList, getPayrollById, generateMonthlyPayroll, createPayroll, updatePayroll, markPayrollPaid, bulkMarkPaid, deletePayroll } = require("./controllers/payroll");

router.get("/", getPayrollList);
router.get("/:id", getPayrollById);
router.post("/generate", generateMonthlyPayroll);
router.post("/create", createPayroll);
router.put("/:id", updatePayroll);
router.post("/:id/pay", markPayrollPaid);
router.post("/bulk-pay", bulkMarkPaid);
router.delete("/:id", deletePayroll);

module.exports = router;
