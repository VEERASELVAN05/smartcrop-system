const cropRecommendation = (N, P, K, temperature, humidity, ph, rainfall) => {
  const recommendations = [];

  // Rice
  if (rainfall > 150 && temperature >= 20 && temperature <= 35
      && humidity > 60 && ph >= 5.5 && ph <= 7.0) {
    recommendations.push({
      crop: "Rice", emoji: "🌾",
      reason: "High rainfall and humidity ideal for rice",
      confidence: "High"
    });
  }

  // Wheat
  if (temperature >= 10 && temperature <= 25
      && rainfall >= 50 && rainfall <= 150
      && ph >= 6.0 && ph <= 7.5) {
    recommendations.push({
      crop: "Wheat", emoji: "🌿",
      reason: "Cool temperature and moderate rainfall suits wheat",
      confidence: "High"
    });
  }

  // Maize
  if (temperature >= 18 && temperature <= 35
      && rainfall >= 50 && rainfall <= 200
      && ph >= 5.5 && ph <= 7.5) {
    recommendations.push({
      crop: "Maize", emoji: "🌽",
      reason: "Warm temperature and moderate rainfall good for maize",
      confidence: "Medium"
    });
  }

  // Cotton
  if (temperature >= 25 && temperature <= 40
      && rainfall >= 50 && rainfall <= 100
      && ph >= 6.0 && ph <= 8.0 && K > 40) {
    recommendations.push({
      crop: "Cotton", emoji: "☁️",
      reason: "High temperature and potassium suits cotton",
      confidence: "High"
    });
  }

  // Sugarcane
  if (temperature >= 20 && temperature <= 38
      && rainfall >= 100 && rainfall <= 200
      && ph >= 6.0 && ph <= 7.5 && N > 50) {
    recommendations.push({
      crop: "Sugarcane", emoji: "🎋",
      reason: "High nitrogen and rainfall suits sugarcane",
      confidence: "Medium"
    });
  }

  // Millet
  if (temperature >= 25 && temperature <= 40
      && rainfall >= 20 && rainfall <= 80
      && ph >= 5.5 && ph <= 7.5) {
    recommendations.push({
      crop: "Millet", emoji: "🌱",
      reason: "Drought resistant — good for low rainfall areas",
      confidence: "High"
    });
  }

  // Groundnut
  if (temperature >= 20 && temperature <= 35
      && rainfall >= 50 && rainfall <= 120
      && ph >= 6.0 && ph <= 7.0 && P > 30) {
    recommendations.push({
      crop: "Groundnut", emoji: "🥜",
      reason: "Good phosphorus and moderate rainfall for groundnut",
      confidence: "Medium"
    });
  }

  // Banana
  if (temperature >= 20 && temperature <= 35
      && rainfall >= 100 && humidity > 70
      && ph >= 5.5 && ph <= 7.0) {
    recommendations.push({
      crop: "Banana", emoji: "🍌",
      reason: "High humidity and rainfall ideal for banana",
      confidence: "High"
    });
  }

  // Default if nothing matches
  if (recommendations.length === 0) {
    recommendations.push({
      crop: "Millet", emoji: "🌱",
      reason: "Millet is resilient and grows in most conditions",
      confidence: "Low"
    });
  }

  // Return top 3
  return recommendations.slice(0, 3);
};

export default cropRecommendation;