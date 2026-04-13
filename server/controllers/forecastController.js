const Forecast = require("../models/Forecast");
const Alert = require("../models/Alert");

const axios = require('axios');

const STOCKOUT_HIGH = 0.7;
const STOCKOUT_MEDIUM = 0.5;
const OVERSTOCK_HIGH = 0.7;
const OVERSTOCK_MEDIUM = 0.5;
const DEMAND_SPIKE_UNITS = 350;
const SIGNIFICANT_GAP_UNITS = 40;

function getNumericDemand(historyRow) {
  const value = historyRow?.unitsSold ?? historyRow?.units_sold;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function calculateAnomalyScore(salesHistory, predictedDailyAvg) {
  if (!Array.isArray(salesHistory) || salesHistory.length < 5) {
    return {
      anomalyScore: 0,
      aiReason: "Insufficient history for anomaly analysis.",
      historyMean: predictedDailyAvg,
      zScore: 0,
    };
  }

  const historyValues = salesHistory.map(getNumericDemand).filter((v) => v !== null);
  if (historyValues.length < 5) {
    return {
      anomalyScore: 0,
      aiReason: "Insufficient valid demand points for AI scoring.",
      historyMean: predictedDailyAvg,
      zScore: 0,
    };
  }

  const mean = historyValues.reduce((sum, v) => sum + v, 0) / historyValues.length;
  const variance =
    historyValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / historyValues.length;
  const std = Math.sqrt(variance);
  const safeStd = std < 1 ? 1 : std;
  const z = (predictedDailyAvg - mean) / safeStd;
  const anomalyScore = Math.min(1, Math.abs(z) / 3);

  const direction = predictedDailyAvg >= mean ? "above" : "below";
  const aiReason = `Forecast daily average ${predictedDailyAvg.toFixed(
    1
  )} is ${direction} baseline ${mean.toFixed(1)} (z=${z.toFixed(2)}).`;

  return { anomalyScore, aiReason, historyMean: mean, zScore: z };
}

function countActiveSignals(rows, candidateKeys) {
  if (!Array.isArray(rows) || rows.length === 0) return 0;
  return rows.reduce((count, row) => {
    const isActive = candidateKeys.some((key) => {
      const value = row?.[key];
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value > 0;
      if (typeof value === "string") return value.trim() !== "";
      return false;
    });
    return count + (isActive ? 1 : 0);
  }, 0);
}

function getSignalSummary(promotions, weather, events) {
  return {
    promoDays: countActiveSignals(promotions, ["promoFlag", "promo_flag", "discountPct", "discount_pct"]),
    eventDays: countActiveSignals(events, ["eventFlag", "event_flag", "impactLevel", "impact_level"]),
    weatherDays: countActiveSignals(weather, ["rainfallMm", "rainfall_mm", "tempAnomaly", "temp_anomaly"]),
  };
}

function buildAiReason({
  alertType,
  predictedDailyAvg,
  historyMean,
  deltaPct,
  zScore,
  stockoutRisk,
  overstockRisk,
  inventoryGap,
  signalSummary,
}) {
  const direction = predictedDailyAvg >= historyMean ? "higher" : "lower";
  const baselinePart = `Forecast/day ${predictedDailyAvg.toFixed(1)} is ${direction} than recent baseline ${historyMean.toFixed(1)} (${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}%, z=${zScore.toFixed(2)}).`;

  const signalParts = [];
  if (signalSummary.promoDays > 0) signalParts.push(`${signalSummary.promoDays} promotion day(s) in input`);
  if (signalSummary.eventDays > 0) signalParts.push(`${signalSummary.eventDays} event day(s) in input`);
  if (signalSummary.weatherDays > 0) signalParts.push(`${signalSummary.weatherDays} weather-impact day(s) in input`);
  const signalsPart = signalParts.length ? ` Signals: ${signalParts.join(", ")}.` : "";

  if (alertType === "stockout") {
    return `${baselinePart} Stockout risk ${Math.round(stockoutRisk * 100)}% with inventory gap ${inventoryGap} units.${signalsPart}`;
  }
  if (alertType === "overstock") {
    return `${baselinePart} Overstock risk ${Math.round(overstockRisk * 100)}% with inventory gap ${inventoryGap} units.${signalsPart}`;
  }
  if (alertType === "demand_spike") {
    return `${baselinePart} Demand spike flagged because 7-day total is unusually high.${signalsPart}`;
  }
  return `${baselinePart} Inventory gap (${inventoryGap} units) crosses configured threshold.${signalsPart}`;
}

function buildAlertsFromForecast({
  storeId,
  productId,
  numericStoreId,
  numericProductId,
  forecastResponse,
  totalPredictedUnits,
  salesHistory,
  promotions,
  weather,
  events,
}) {
  const alerts = [];
  const stockoutRisk = Number(forecastResponse.stockout_risk || 0);
  const overstockRisk = Number(forecastResponse.overstock_risk || 0);
  const recommendedInventory = Number(forecastResponse.recommended_inventory || 0);
  const inventoryGap = Math.round(recommendedInventory - totalPredictedUnits);
  const predictedDailyAvg = totalPredictedUnits / 7;
  const { anomalyScore, aiReason, historyMean, zScore } = calculateAnomalyScore(
    salesHistory,
    predictedDailyAvg
  );
  const safeMean = historyMean === 0 ? 1 : historyMean;
  const deltaPct = ((predictedDailyAvg - historyMean) / safeMean) * 100;
  const signalSummary = getSignalSummary(promotions, weather, events);
  const aiSeverityBoost = anomalyScore >= 0.8;

  const baseAlert = {
    storeId,
    productId,
    numeric_store_id: numericStoreId,
    numeric_product_id: numericProductId,
    stockout_risk: stockoutRisk,
    overstock_risk: overstockRisk,
    predicted_units_sold: totalPredictedUnits,
    recommended_inventory_level: recommendedInventory,
    inventory_gap: inventoryGap,
    anomaly_score: anomalyScore,
  };

  if (stockoutRisk >= STOCKOUT_MEDIUM) {
    alerts.push({
      ...baseAlert,
      type: "stockout",
      severity: stockoutRisk >= STOCKOUT_HIGH || aiSeverityBoost ? "high" : "medium",
      message: `Critical stockout risk (${Math.round(stockoutRisk * 100)}%) identified.`,
      ai_reason: buildAiReason({
        alertType: "stockout",
        predictedDailyAvg,
        historyMean,
        deltaPct,
        zScore,
        stockoutRisk,
        overstockRisk,
        inventoryGap,
        signalSummary,
      }),
    });
  }

  if (overstockRisk >= OVERSTOCK_MEDIUM) {
    alerts.push({
      ...baseAlert,
      type: "overstock",
      severity: overstockRisk >= OVERSTOCK_HIGH || aiSeverityBoost ? "high" : "medium",
      message: `Significant overstock risk (${Math.round(overstockRisk * 100)}%) detected.`,
      ai_reason: buildAiReason({
        alertType: "overstock",
        predictedDailyAvg,
        historyMean,
        deltaPct,
        zScore,
        stockoutRisk,
        overstockRisk,
        inventoryGap,
        signalSummary,
      }),
    });
  }

  if (totalPredictedUnits >= DEMAND_SPIKE_UNITS) {
    alerts.push({
      ...baseAlert,
      type: "demand_spike",
      severity: "high",
      message: `Abnormal demand spike projected (${Math.round(totalPredictedUnits)} units/week).`,
      ai_reason: buildAiReason({
        alertType: "demand_spike",
        predictedDailyAvg,
        historyMean,
        deltaPct,
        zScore,
        stockoutRisk,
        overstockRisk,
        inventoryGap,
        signalSummary,
      }),
    });
  }

  if (Math.abs(inventoryGap) >= SIGNIFICANT_GAP_UNITS) {
    alerts.push({
      ...baseAlert,
      type: "inventory_gap",
      severity: Math.abs(inventoryGap) >= 80 ? "high" : "low",
      message:
        inventoryGap > 0
          ? `Inventory shortfall of ${inventoryGap} units forecasted.`
          : `Excess inventory of ${Math.abs(inventoryGap)} units expected.`,
      ai_reason:
        anomalyScore > 0
          ? buildAiReason({
              alertType: "inventory_gap",
              predictedDailyAvg,
              historyMean,
              deltaPct,
              zScore,
              stockoutRisk,
              overstockRisk,
              inventoryGap,
              signalSummary,
            })
          : aiReason,
    });
  }

  return alerts;
}

// ➕ Run Forecast (calls ML service)
exports.addForecast = async (req, res) => {
  try {
    const { storeId, productId, numericStoreId, numericProductId, salesHistory, leadTimeDays, promotions, weather, events } = req.body;

    // Prepare payload for ML service using numeric IDs
    const mlBody = {
      storeId: numericStoreId,
      productId: numericProductId,
      salesHistory,
      leadTimeDays,
      promotions: promotions || [],
      weather: weather || [],
      events: events || []
    };

    // Forward request to ML service with explainability
    const mlResponse = await axios.post('http://localhost:8001/api/forecast/explain', mlBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Save to database using MongoDB IDs
    const totalPredictedUnits = mlResponse.data.forecast.reduce(
      (sum, day) => sum + day.predicted_units,
      0
    );
    const forecastData = {
      date: new Date().toISOString().split('T')[0],
      storeId: storeId, // MongoDB ObjectId
      productId: productId, // MongoDB ObjectId
      predicted_units_sold: totalPredictedUnits,
      recommended_inventory_level: mlResponse.data.recommended_inventory,
      explanation: mlResponse.data.explanation // Persist the AI explanation
    };

    await Forecast.create(forecastData);

    // Build alerts with correct MongoDB ObjectIds and numeric IDs
    const alertsToInsert = buildAlertsFromForecast({
      storeId, // MongoDB ObjectId
      productId, // MongoDB ObjectId
      numericStoreId,
      numericProductId,
      forecastResponse: mlResponse.data,
      totalPredictedUnits,
      salesHistory,
      promotions: promotions || [],
      weather: weather || [],
      events: events || [],
    });
    if (alertsToInsert.length) {
      await Alert.insertMany(alertsToInsert);
    }

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
    const productId = req.params.id; // Could be MongoDB ID or numeric ID string

    // First check if we have cached forecast by MongoDB ID
    const cached = await Forecast.find({
      productId: productId
    }).sort({ createdAt: -1 }).limit(1);

    if (cached && cached.length > 0) {
      // Return cached data
      res.json(cached[0]);
    } else {
      // No cached data, return message to run forecast first
      res.json({
        message: "No forecast data available. Please run a forecast first.",
        productId: productId
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};