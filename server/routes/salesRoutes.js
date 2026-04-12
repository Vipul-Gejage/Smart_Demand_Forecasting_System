const express = require("express");
const router = express.Router();

const {
  getSalesSummary,
  getSalesTrends,
  getProductSales
} = require("../controllers/salesController");

// 🔐 middleware
const authMiddleware = require("../middleware/authMiddleware");

router.get("/summary", authMiddleware, getSalesSummary);
router.get("/trends", authMiddleware, getSalesTrends);
router.get("/product/:id", authMiddleware, getProductSales);

module.exports = router;