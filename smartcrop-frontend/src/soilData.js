// Average NPK and pH values based on
// crop type and soil type in Tamil Nadu
// Source: ICAR Agricultural Research Data

const soilData = {
  // Format: CropType + SoilType → { N, P, K, ph }

  // RICE
  "Rice_Red Soil":    { N: 80,  P: 40,  K: 40,  ph: 6.0 },
  "Rice_Black Soil":  { N: 90,  P: 45,  K: 45,  ph: 6.5 },
  "Rice_Sandy Soil":  { N: 70,  P: 35,  K: 35,  ph: 5.8 },
  "Rice_Loamy Soil":  { N: 85,  P: 42,  K: 42,  ph: 6.2 },
  "Rice_Clay Soil":   { N: 88,  P: 44,  K: 43,  ph: 6.3 },

  // WHEAT
  "Wheat_Red Soil":   { N: 100, P: 50,  K: 50,  ph: 6.5 },
  "Wheat_Black Soil": { N: 110, P: 55,  K: 52,  ph: 7.0 },
  "Wheat_Sandy Soil": { N: 90,  P: 45,  K: 45,  ph: 6.2 },
  "Wheat_Loamy Soil": { N: 105, P: 52,  K: 50,  ph: 6.7 },
  "Wheat_Clay Soil":  { N: 108, P: 53,  K: 51,  ph: 6.8 },

  // MAIZE
  "Maize_Red Soil":   { N: 85,  P: 55,  K: 45,  ph: 6.0 },
  "Maize_Black Soil": { N: 90,  P: 60,  K: 48,  ph: 6.5 },
  "Maize_Sandy Soil": { N: 75,  P: 48,  K: 40,  ph: 5.8 },
  "Maize_Loamy Soil": { N: 88,  P: 57,  K: 46,  ph: 6.2 },
  "Maize_Clay Soil":  { N: 87,  P: 56,  K: 45,  ph: 6.3 },

  // COTTON
  "Cotton_Red Soil":   { N: 100, P: 50,  K: 60,  ph: 7.0 },
  "Cotton_Black Soil": { N: 120, P: 60,  K: 70,  ph: 7.5 },
  "Cotton_Sandy Soil": { N: 90,  P: 45,  K: 55,  ph: 6.5 },
  "Cotton_Loamy Soil": { N: 110, P: 55,  K: 65,  ph: 7.2 },
  "Cotton_Clay Soil":  { N: 115, P: 57,  K: 67,  ph: 7.3 },

  // SUGARCANE
  "Sugarcane_Red Soil":   { N: 150, P: 60,  K: 120, ph: 6.5 },
  "Sugarcane_Black Soil": { N: 175, P: 70,  K: 140, ph: 7.0 },
  "Sugarcane_Sandy Soil": { N: 130, P: 55,  K: 110, ph: 6.2 },
  "Sugarcane_Loamy Soil": { N: 160, P: 65,  K: 130, ph: 6.7 },
  "Sugarcane_Clay Soil":  { N: 165, P: 67,  K: 132, ph: 6.8 },

  // MILLET
  "Millet_Red Soil":   { N: 60,  P: 30,  K: 30,  ph: 6.0 },
  "Millet_Black Soil": { N: 70,  P: 35,  K: 35,  ph: 6.5 },
  "Millet_Sandy Soil": { N: 50,  P: 25,  K: 25,  ph: 5.5 },
  "Millet_Loamy Soil": { N: 65,  P: 32,  K: 32,  ph: 6.2 },
  "Millet_Clay Soil":  { N: 68,  P: 34,  K: 33,  ph: 6.3 },

  // GROUNDNUT
  "Groundnut_Red Soil":   { N: 25,  P: 50,  K: 50,  ph: 6.0 },
  "Groundnut_Black Soil": { N: 30,  P: 55,  K: 55,  ph: 6.5 },
  "Groundnut_Sandy Soil": { N: 20,  P: 45,  K: 45,  ph: 5.8 },
  "Groundnut_Loamy Soil": { N: 27,  P: 52,  K: 52,  ph: 6.2 },
  "Groundnut_Clay Soil":  { N: 28,  P: 53,  K: 53,  ph: 6.3 },

  // SOYBEAN
  "Soybean_Red Soil":   { N: 40,  P: 60,  K: 40,  ph: 6.5 },
  "Soybean_Black Soil": { N: 45,  P: 65,  K: 45,  ph: 7.0 },
  "Soybean_Sandy Soil": { N: 35,  P: 55,  K: 35,  ph: 6.0 },
  "Soybean_Loamy Soil": { N: 42,  P: 62,  K: 42,  ph: 6.7 },
  "Soybean_Clay Soil":  { N: 43,  P: 63,  K: 43,  ph: 6.8 },

  // BANANA
  "Banana_Red Soil":   { N: 110, P: 45,  K: 180, ph: 6.0 },
  "Banana_Black Soil": { N: 120, P: 50,  K: 200, ph: 6.5 },
  "Banana_Sandy Soil": { N: 100, P: 40,  K: 160, ph: 5.8 },
  "Banana_Loamy Soil": { N: 115, P: 47,  K: 190, ph: 6.2 },
  "Banana_Clay Soil":  { N: 118, P: 48,  K: 195, ph: 6.3 },

  // MANGO
  "Mango_Red Soil":   { N: 60,  P: 30,  K: 60,  ph: 6.0 },
  "Mango_Black Soil": { N: 70,  P: 35,  K: 70,  ph: 6.5 },
  "Mango_Sandy Soil": { N: 50,  P: 25,  K: 50,  ph: 5.5 },
  "Mango_Loamy Soil": { N: 65,  P: 32,  K: 65,  ph: 6.2 },
  "Mango_Clay Soil":  { N: 68,  P: 34,  K: 68,  ph: 6.3 },
};

export const getSoilValues = (cropType, soilType) => {
  const key = `${cropType}_${soilType}`;
  return soilData[key] || { N: 80, P: 40, K: 40, ph: 6.5 };
};

export default soilData;