// SmartCrop Risk Engine v2.0
// Cumulative risk + LSTM simulation + NDVI calculation

// ─────────────────────────────────────────
// NDVI CALCULATION
// Normalized Difference Vegetation Index
// Simulated from weather parameters
// Real NDVI range: -1 to +1
// Healthy crop: 0.4 to 0.8
// ─────────────────────────────────────────
export const calculateNDVI = (
  rainfall, temperature, humidity, dayOfSeason
) => {
  // Base NDVI from rainfall (most important factor)
  let ndvi = 0.1;

  // Rainfall contribution (optimal: 100-200mm/month)
  if (rainfall > 5) ndvi += 0.3;
  if (rainfall > 15) ndvi += 0.2;
  if (rainfall > 30) ndvi += 0.1;

  // Temperature contribution (optimal: 20-30°C)
  if (temperature >= 20 && temperature <= 30) {
    ndvi += 0.2;
  } else if (temperature > 30 && temperature <= 35) {
    ndvi += 0.1;
  } else if (temperature > 38) {
    ndvi -= 0.15;
  }

  // Humidity contribution
  if (humidity > 60) ndvi += 0.1;
  if (humidity > 75) ndvi += 0.05;

  // Season progress (crops grow over time)
  const seasonBonus = Math.min(dayOfSeason / 180, 1) * 0.1;
  ndvi += seasonBonus;

  // Clamp between -1 and 1
  ndvi = Math.max(-0.5, Math.min(0.9, ndvi));
  return parseFloat(ndvi.toFixed(3));
};

export const getNDVIStatus = (ndvi) => {
  if (ndvi >= 0.5) return {
    status: 'Excellent', color: '#15803d',
    bg: '#f0fdf4', desc: 'Crop is very healthy'
  };
  if (ndvi >= 0.3) return {
    status: 'Good', color: '#16a34a',
    bg: '#f0fdf4', desc: 'Crop growing normally'
  };
  if (ndvi >= 0.1) return {
    status: 'Moderate', color: '#d97706',
    bg: '#fffbeb', desc: 'Some stress detected'
  };
  return {
    status: 'Stressed', color: '#dc2626',
    bg: '#fef2f2', desc: 'Crop under severe stress'
  };
};

// ─────────────────────────────────────────
// LSTM RAINFALL TREND SIMULATION
// Uses exponential smoothing + seasonality
// to predict next 7 days rainfall
// ─────────────────────────────────────────
export const predictRainfallTrend = (
  currentRainfall,
  temperature,
  humidity,
  district,
  month
) => {
  // Seasonal rainfall patterns for Tamil Nadu
  const seasonalFactors = {
    1: 0.3, 2: 0.2, 3: 0.3,  4: 0.5,
    5: 0.6, 6: 0.7, 7: 0.8,  8: 0.9,
    9: 1.0, 10: 1.1, 11: 0.9, 12: 0.5
  };

  const seasonFactor = seasonalFactors[month] || 0.5;

  // Humidity drives rainfall probability
  const humidityFactor = humidity / 100;

  // Temperature inverse relationship
  const tempFactor = Math.max(0, (40 - temperature) / 40);

  // Base prediction
  const basePrediction = currentRainfall * 0.3 +
    (humidityFactor * 20 * seasonFactor) +
    (tempFactor * 10);

  // Generate 7 day predictions with realistic variation
  const predictions = [];
  let runningValue = basePrediction;

  for (let day = 1; day <= 7; day++) {
    // Add controlled randomness (±30%)
    const variation = (Math.sin(day * 1.5) * 0.3 + 1);
    const dayRainfall = Math.max(0,
      runningValue * variation * seasonFactor
    );

    // Exponential smoothing
    runningValue = runningValue * 0.7 +
                   dayRainfall * 0.3;

    const date = new Date();
    date.setDate(date.getDate() + day);

    predictions.push({
      day: `Day ${day}`,
      date: date.toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric'
      }),
      rainfall: parseFloat(dayRainfall.toFixed(1)),
      confidence: Math.max(60, 95 - day * 5)
    });
  }

  // Calculate trend
  const firstHalf = predictions.slice(0, 3)
    .reduce((s, p) => s + p.rainfall, 0) / 3;
  const secondHalf = predictions.slice(4)
    .reduce((s, p) => s + p.rainfall, 0) / 3;

  const trend = secondHalf > firstHalf * 1.2
    ? 'INCREASING'
    : secondHalf < firstHalf * 0.8
    ? 'DECREASING'
    : 'STABLE';

  const totalPredicted = predictions.reduce(
    (s, p) => s + p.rainfall, 0
  );

  return {
    predictions,
    trend,
    totalPredicted: parseFloat(totalPredicted.toFixed(1)),
    avgDaily: parseFloat((totalPredicted / 7).toFixed(1)),
    riskForecast: totalPredicted < 10
      ? 'HIGH DROUGHT RISK'
      : totalPredicted < 30
      ? 'MODERATE RISK'
      : 'LOW RISK'
  };
};

// ─────────────────────────────────────────
// CUMULATIVE RISK ENGINE
// Insurance triggers only after consistent
// high risk over multiple days
// ─────────────────────────────────────────
export const calculateCumulativeRisk = (
  predictions // array of past predictions from DB
) => {
  if (!predictions || predictions.length === 0) {
    return {
      cumulativeRisk: 0,
      consecutiveHighRisk: 0,
      insuranceEligible: false,
      trend: 'INSUFFICIENT_DATA',
      message: 'Need more predictions to assess cumulative risk'
    };
  }

  // Get last 7 predictions
  const recent = predictions.slice(0, 7);
  const scores = recent.map(p => p.risk_score);

  // Calculate weighted average
  // Recent predictions weighted more heavily
  const weights = [0.25, 0.20, 0.15, 0.12,
                   0.10, 0.10, 0.08];
  let weightedSum = 0;
  let totalWeight = 0;

  scores.forEach((score, i) => {
    const w = weights[i] || 0.05;
    weightedSum += score * w;
    totalWeight += w;
  });

  const cumulativeRisk = Math.round(
    weightedSum / totalWeight
  );

  // Count consecutive high risk days
  let consecutiveHighRisk = 0;
  for (const p of recent) {
    if (p.risk_score >= 60) {
      consecutiveHighRisk++;
    } else break;
  }

  // Trend analysis
  const avgFirst = scores.slice(0, 3).reduce(
    (s, v) => s + v, 0
  ) / Math.min(3, scores.length);
  const avgLast = scores.slice(-3).reduce(
    (s, v) => s + v, 0
  ) / Math.min(3, scores.length);

  const trend = avgFirst > avgLast + 10
    ? 'IMPROVING'
    : avgFirst < avgLast - 10
    ? 'WORSENING'
    : 'STABLE';

  // Insurance eligible only after 3+ consecutive high risk
  const insuranceEligible = consecutiveHighRisk >= 3;

  let message = '';
  if (insuranceEligible) {
    message = `High risk detected for ${consecutiveHighRisk} consecutive days. Insurance claim triggered.`;
  } else if (consecutiveHighRisk > 0) {
    message = `High risk for ${consecutiveHighRisk} day(s). Insurance triggers after 3 consecutive days.`;
  } else if (cumulativeRisk >= 60) {
    message = 'Overall high risk but not yet consecutive. Monitor closely.';
  } else {
    message = 'Crop conditions manageable. Continue monitoring.';
  }

  return {
    cumulativeRisk,
    consecutiveHighRisk,
    insuranceEligible,
    trend,
    message,
    daysUntilTrigger: Math.max(
      0, 3 - consecutiveHighRisk
    )
  };
};

// ─────────────────────────────────────────
// COMBINED RISK SCORE
// Combines ML prediction + NDVI + cumulative
// ─────────────────────────────────────────
export const getCombinedRiskScore = (
  mlRisk, ndvi, cumulativeRisk
) => {
  // Weights
  const mlWeight = 0.50;
  const ndviWeight = 0.25;
  const cumulativeWeight = 0.25;

  // Convert NDVI to risk (lower NDVI = higher risk)
  const ndviRisk = Math.max(0,
    Math.min(100, (0.5 - ndvi) * 200)
  );

  const combined = (
    mlRisk * mlWeight +
    ndviRisk * ndviWeight +
    cumulativeRisk * cumulativeWeight
  );

  return Math.round(combined);
};