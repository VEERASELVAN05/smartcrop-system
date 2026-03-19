from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import joblib
import pandas as pd
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# ─────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────
app = FastAPI(
    title="SmartCrop API",
    description="AI-Powered Crop Failure Prediction System",
    version="2.0.0"
)

# ⭐ CORS — THIS MUST BE RIGHT AFTER app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load(r"C:\Capstone Project\smartcrop-system\models\best_model_random_forest.pkl")
    scaler = joblib.load(r"C:\Capstone Project\smartcrop-system\models\scaler.pkl")
    print("✅ SmartCrop API v2.0 started!")
    print("✅ Random Forest model loaded!")
    print("✅ Scaler loaded!")
except Exception as e:
    print(f"❌ Load error: {e}")
    model = None
    scaler = None

# ─────────────────────────────────────────
# AUTH SETUP
# ─────────────────────────────────────────
SECRET_KEY = "smartcrop_secret_key_2026"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# In-memory storage (until PostgreSQL connected)
users_db = {}
profiles_db = {}

# ─────────────────────────────────────────
# DATA MODELS
# ─────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    phone: str
    district: str
    password: str

class LoginRequest(BaseModel):
    phone: str
    password: str

class FarmProfile(BaseModel):
    crop_type: str
    land_size: float
    soil_type: str
    irrigation_type: str
    sowing_season: str
    district: str
    village: str

class PredictRequest(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

# ─────────────────────────────────────────
# AUTH HELPERS
# ─────────────────────────────────────────
def hash_password(password: str):
    return pwd_context.hash(password[:72])

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain[:72], hashed)

def create_token(phone: str):
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": phone, "exp": expire},
        SECRET_KEY, algorithm=ALGORITHM
    )

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY, algorithms=[ALGORITHM]
        )
        phone = payload.get("sub")
        if phone not in users_db:
            raise HTTPException(status_code=401, detail="User not found")
        return users_db[phone]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─────────────────────────────────────────
# ROUTE 1 — Health Check
# ─────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "SmartCrop API v2.0 is running!",
        "model": "Random Forest Classifier",
        "cv_accuracy": "99.95%",
        "version": "2.0.0"
    }

# ─────────────────────────────────────────
# ROUTE 2 — Register
# ─────────────────────────────────────────
@app.post("/register")
def register(data: RegisterRequest):
    try:
        if data.phone in users_db:
            raise HTTPException(
                status_code=400,
                detail="Phone number already registered"
            )
        users_db[data.phone] = {
            "name": data.name,
            "phone": data.phone,
            "district": data.district,
            "password": hash_password(data.password),
            "created_at": str(datetime.now())
        }
        token = create_token(data.phone)
        return {
            "message": f"Welcome to SmartCrop, {data.name}!",
            "token": token,
            "user": {
                "name": data.name,
                "phone": data.phone,
                "district": data.district
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# ROUTE 3 — Login
# ─────────────────────────────────────────
@app.post("/login")
def login(data: LoginRequest):
    try:
        user = users_db.get(data.phone)
        if not user or not verify_password(data.password, user["password"]):
            raise HTTPException(
                status_code=401,
                detail="Invalid phone number or password"
            )
        token = create_token(data.phone)
        has_profile = data.phone in profiles_db
        return {
            "message": f"Welcome back, {user['name']}!",
            "token": token,
            "user": {
                "name": user["name"],
                "phone": user["phone"],
                "district": user["district"]
            },
            "has_profile": has_profile
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# ROUTE 4 — Save Farm Profile
# ─────────────────────────────────────────
@app.post("/profile")
def save_profile(
    data: FarmProfile,
    current_user: dict = Depends(get_current_user)
):
    try:
        profiles_db[current_user["phone"]] = {
            "crop_type": data.crop_type,
            "land_size": data.land_size,
            "soil_type": data.soil_type,
            "irrigation_type": data.irrigation_type,
            "sowing_season": data.sowing_season,
            "district": data.district,
            "village": data.village,
            "saved_at": str(datetime.now())
        }
        return {
            "message": "Farm profile saved successfully!",
            "profile": profiles_db[current_user["phone"]]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# ROUTE 5 — Get Profile
# ─────────────────────────────────────────
@app.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    phone = current_user["phone"]
    if phone not in profiles_db:
        return {
            "has_profile": False,
            "message": "No farm profile found."
        }
    return {
        "has_profile": True,
        "profile": profiles_db[phone]
    }

# ─────────────────────────────────────────
# ROUTE 6 — Predict
# ─────────────────────────────────────────
@app.post("/predict")
def predict(
    data: PredictRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        if model is None:
            raise HTTPException(
                status_code=500,
                detail="ML model not loaded"
            )
        input_data = pd.DataFrame(
            [[data.N, data.P, data.K, data.temperature,
            data.humidity, data.ph, data.rainfall]],
            columns=['N', 'P', 'K', 'temperature',
                     'humidity', 'ph', 'rainfall']
        )

        # Scale input before prediction
        input_scaled = scaler.transform(input_data)
        input_df = pd.DataFrame(
            input_scaled,
            columns=['N', 'P', 'K', 'temperature',
                    'humidity', 'ph', 'rainfall']
        )

        probability = model.predict_proba(input_df)[0][1]
        risk_score = round(probability * 100, 2)

        factors = []
        if data.rainfall < 50:
            factors.append("Very low rainfall")
        if data.temperature > 35:
            factors.append("High temperature stress")
        if data.ph < 5.5 or data.ph > 7.5:
            factors.append("Soil pH imbalance")
        if data.N < 20:
            factors.append("Low nitrogen levels")

        if risk_score < 30:
            status = "SAFE"
            color = "green"
            advice = "Crop is healthy. Continue normal farming practices."
            insurance = "Not eligible — risk is low"
        elif risk_score < 60:
            status = "MODERATE RISK"
            color = "yellow"
            advice = "Monitor closely. Consider irrigation and soil treatment."
            insurance = "Not yet eligible — monitor situation"
        else:
            status = "HIGH RISK"
            color = "red"
            advice = "Immediate action required! Irrigate and apply fertilizer."
            insurance = "ELIGIBLE — Insurance claim auto-triggered!"

        return {
            "farmer": current_user["name"],
            "risk_score": risk_score,
            "status": status,
            "color": color,
            "advice": advice,
            "insurance_status": insurance,
            "contributing_factors": factors if factors else ["All parameters normal"],
            "timestamp": str(datetime.now())
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))