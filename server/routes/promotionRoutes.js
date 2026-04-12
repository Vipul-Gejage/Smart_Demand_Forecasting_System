const express = require("express");
const router = express.Router();
const {
  getPromotions,
  addPromotion,
} = require("../controllers/promotionController");

router.get("/", getPromotions);
router.post("/", addPromotion);

module.exports = router;