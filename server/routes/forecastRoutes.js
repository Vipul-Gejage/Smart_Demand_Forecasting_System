const express = require("express");
const router = express.Router();

const {
  addForecast,
  getForecasts,
  getForecastById
} = require("../controllers/forecastController");

// 🔐 middleware
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addForecast);
router.get("/", authMiddleware, getForecasts);
router.get("/:id", authMiddleware, getForecastById);

module.exports = router;