const { Router } = require("express");
const { addJob, updateJob, getJob, getJobsList, deleteJob } = require("./controllers/jobs");
const router = Router();

router.post("/add", addJob);
router.put("/update", updateJob);
router.get("/:id", getJob);
router.get("/", getJobsList);
router.delete("/:id", deleteJob);

module.exports = router;
