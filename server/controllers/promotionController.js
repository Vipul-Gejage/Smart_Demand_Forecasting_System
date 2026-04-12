const Promotion = require("../models/Promotion");

// GET promotions
exports.getPromotions = async (req, res) => {
  try {
    const promos = await Promotion.find();
    res.json(promos); // MUST be array
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching promos" });
  }
};

// ADD promotion
exports.addPromotion = async (req, res) => {
  try {
    const promo = new Promotion(req.body);
    await promo.save();

    res.json(promo);
  } catch (err) {
    res.status(500).json({ message: "Error adding promo" });
  }
};