const Forecast = require("../models/Forecast");

const axios = require('axios');

// ➕ Run Forecast (calls ML service)
exports.addForecast = async (req, res) => {
  try {
    // Forward request to ML service
    const mlResponse = await axios.post('http://localhost:8001/api/forecast', req.body, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Save to database if needed
    const Forecast = require("../models/Forecast");
    const forecastData = {
      date: new Date().toISOString().split('T')[0],
      store_id: req.body.storeId,
      product_id: req.body.productId,
      predicted_units_sold: mlResponse.data.forecast.reduce((sum, day) => sum + day.predicted_units, 0),
      recommended_inventory_level: mlResponse.data.recommended_inventory
    };

    await Forecast.create(forecastData);

    res.status(201).json(mlResponse.data);
  } catch (error) {
    console.error('ML Service Error:', error.message);
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

// 🔍 Get Forecast by product/store (calls ML service if no cached data)
exports.getForecastById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    // First check if we have cached forecast
    const Forecast = require("../models/Forecast");
    const cached = await Forecast.find({
      product_id: productId
    }).sort({ createdAt: -1 }).limit(1);

    if (cached && cached.length > 0) {
      // Return cached data
      res.json(cached[0]);
    } else {
      // No cached data, return message to run forecast first
      res.json({
        message: "No forecast data available. Please run a forecast first.",
        product_id: productId
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};