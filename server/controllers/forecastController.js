const Forecast = require("../models/Forecast");

// ➕ Save Forecast (ML will send this)
exports.addForecast = async (req, res) => {
  try {
    const data = await Forecast.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📥 Get All Forecasts
exports.getForecasts = async (req, res) => {
  try {
    const data = await Forecast.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Get Forecast by product/store
exports.getForecastById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const data = await Forecast.find({
      product_id: productId
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};