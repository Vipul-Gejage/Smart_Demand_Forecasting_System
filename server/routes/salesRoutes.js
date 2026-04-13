const express = require("express");
const router = express.Router();

const {
  getSalesSummary,
  getSalesTrends,
  getProductSales,
  getDashboardStats,
  getSalesHistoryForForecast
} = require("../controllers/salesController");

// 🔐 middleware
const authMiddleware = require("../middleware/authMiddleware");

router.get("/dashboard", authMiddleware, getDashboardStats);
router.get("/summary", authMiddleware, getSalesSummary);
router.get("/trends", authMiddleware, getSalesTrends);
router.get("/product/:id", authMiddleware, getProductSales);
router.get("/history", getSalesHistoryForForecast);

module.exports = router;