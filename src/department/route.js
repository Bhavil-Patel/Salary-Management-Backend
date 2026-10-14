const { Router } = require("express");
const { addDepartment, updateDepartment, getDepartment, getDepartmentsList, deleteDepartment } = require("./controllers/department");
const router = Router();

router.post("/add", addDepartment);
router.put("/update", updateDepartment);
router.get("/:id", getDepartment);
router.get("/", getDepartmentsList);
router.delete("/:id", deleteDepartment);

module.exports = router;
