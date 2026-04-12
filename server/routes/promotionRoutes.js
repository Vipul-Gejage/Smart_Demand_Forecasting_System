const express = require("express");
const router = express.Router();

const {
  addPromotion,
  getPromotions,
  updatePromotion,
  deletePromotion
} = require("../controllers/promotionController");

// 🔐 middleware
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addPromotion);
router.get("/", authMiddleware, getPromotions);
router.put("/:id", authMiddleware, updatePromotion);
router.delete("/:id", authMiddleware, deletePromotion);

module.exports = router;