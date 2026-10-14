const express = require("express");
const router = express.Router();
const { getSalaryRevisions, addSalaryRevision, deleteSalaryRevision } = require("./controllers/salaryRevision");

router.get("/", getSalaryRevisions);
router.post("/add", addSalaryRevision);
router.delete("/:id", deleteSalaryRevision);

module.exports = router;
