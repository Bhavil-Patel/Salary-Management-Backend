const { Router } = require("express");
const { getDashboardInsights } = require("./controllers/dashboard");
const router = Router();

router.get("/", getDashboardInsights);

module.exports = router;
