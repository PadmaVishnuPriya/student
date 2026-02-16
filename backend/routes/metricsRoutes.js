const express = require("express");
const router = express.Router();
const { addMetrics, getMetrics, getAllMetrics, deleteMetric } = require("../controllers/metricsController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addMetrics);
router.get("/", authMiddleware, getAllMetrics);
router.get("/:studentId", authMiddleware, getMetrics);
router.delete("/:id", authMiddleware, deleteMetric);

module.exports = router;
