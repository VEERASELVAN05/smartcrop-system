from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd

# Initialize app
app = FastAPI(
    title="SmartCrop API",
    description="AI-Powered Crop Failure Prediction System",
    version="1.0.0"
)

# Allow React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Load the trained model
model = joblib.load('../models/crop_failure_model.pkl')
print("✅ Model loaded successfully!")

# Define input structure
class FarmerData(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# Route 1 — Health check
@app.get("/health")
def health():
    return {
        "status": "SmartCrop API is running!",
        "model": "Random Forest Classifier",
        "version": "1.0.0"
    }

# Route 2 — Predict crop failure risk
@app.post("/predict")
def predict(data: FarmerData):
    # Prepare input
    input_data = pd.DataFrame(
        [[data.N, data.P, data.K, data.temperature,
          data.humidity, data.ph, data.rainfall]],
        columns=['N', 'P', 'K', 'temperature',
                 'humidity', 'ph', 'rainfall']
    )

    # Get prediction
    probability = model.predict_proba(input_data)[0][1]
    risk_score = round(probability * 100, 2)

    # Determine status
    if risk_score < 30:
        status = "SAFE"
        color = "green"
        advice = "Your crop is healthy. Continue normal farming practices."
        insurance = "Not eligible — risk too low"
    elif risk_score < 60:
        status = "MODERATE RISK"
        color = "yellow"
        advice = "Consider irrigation and soil treatment this week."
        insurance = "Monitor closely — not yet eligible"
    else:
        status = "HIGH RISK"
        color = "red"
        advice = "High failure risk detected! Take immediate action."
        insurance = "ELIGIBLE — Insurance claim auto-triggered!"

    return {
        "risk_score": risk_score,
        "status": status,
        "color": color,
        "advice": advice,
        "insurance_status": insurance
    }