const { getDashboardInsightsService } = require("../services/dashboardServices");

async function getDashboardInsights(req, res) {
    try {
        const result = await getDashboardInsightsService();
        return res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
        console.error("getDashboardInsights controller error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

module.exports = {
    getDashboardInsights
};
