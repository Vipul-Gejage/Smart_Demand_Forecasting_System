const express = require("express");
const router = express.Router();

const {
  addForecast,
  getForecasts,
  getForecastById
} = require("../controllers/forecastController");

// 🔐 middleware
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", addForecast);
router.get("/", getForecasts);
router.get("/:id", getForecastById);

module.exports = router;