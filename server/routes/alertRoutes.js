const express = require("express");
const router = express.Router();

const { getAlerts, updateAlertStatus } = require("../controllers/alertController");

// 🔐 middleware
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getAlerts);
router.patch("/:id/status", authMiddleware, updateAlertStatus);

module.exports = router;