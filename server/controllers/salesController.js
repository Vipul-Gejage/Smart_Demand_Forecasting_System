const Sales = require("../models/Sales");

// 📊 1. Sales Summary
exports.getSalesSummary = async (req, res) => {
  try {
    const total = await Sales.aggregate([
      {
        $group: {
          _id: null,
          total_units_sold: { $sum: "$units_sold" },
          total_revenue: {
            $sum: { $multiply: ["$units_sold", "$sell_price"] }
          }
        }
      }
    ]);

    res.json(total[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 📈 2. Sales Trends (date-wise)
exports.getSalesTrends = async (req, res) => {
  try {
    const trends = await Sales.aggregate([
      {
        $group: {
          _id: "$date",
          total_units: { $sum: "$units_sold" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 📦 3. Product-wise Sales
exports.getProductSales = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const data = await Sales.aggregate([
      {
        $match: { product_id: productId }
      },
      {
        $group: {
          _id: "$product_id",
          total_units: { $sum: "$units_sold" },
          avg_price: { $avg: "$sell_price" }
        }
      }
    ]);

    res.json(data[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};