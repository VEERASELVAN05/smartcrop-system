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
from database import get_db, init_db, Farmer, FarmProfile, RiskPrediction, InsuranceClaim
from sqlalchemy.orm import Session

# ─────────────────────────────────────────
# APP SETUP
# ─────────────────────────────────────────
app = FastAPI(
    title="SmartCrop API",
    description="AI-Powered Crop Failure Prediction System",
    version="2.0.0"
)
# Initialize database on startup
init_db()

# ⭐ CORS — THIS MUST BE RIGHT AFTER app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = joblib.load(r"C:\Users\tej13\smartcrop-system\models\best_model_random_forest.pkl")
    scaler = joblib.load(r"C:\Users\tej13\smartcrop-system\models\scaler.pkl" )
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

class FarmProfileRequest(BaseModel):
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
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY, algorithms=[ALGORITHM]
        )
        phone = payload.get("sub")
        if not phone:
            raise HTTPException(
                status_code=401, detail="Invalid token"
            )

        # Get from PostgreSQL database
        farmer = db.query(Farmer).filter(
            Farmer.phone == phone
        ).first()

        if not farmer:
            raise HTTPException(
                status_code=401, detail="User not found"
            )

        return {
            "name": farmer.name,
            "phone": farmer.phone,
            "district": farmer.district
        }
    except JWTError:
        raise HTTPException(
            status_code=401, detail="Invalid token"
        )

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
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    try:
        existing = db.query(Farmer).filter(
            Farmer.phone == data.phone).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Phone number already registered"
            )
        farmer = Farmer(
            name=data.name,
            phone=data.phone,
            district=data.district,
            password=hash_password(data.password[:72])
        )
        db.add(farmer)
        db.commit()
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
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# ─────────────────────────────────────────
# ROUTE 3 — Login
# ─────────────────────────────────────────
@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        farmer = db.query(Farmer).filter(
            Farmer.phone == data.phone).first()
        if not farmer or not farmer.password or not verify_password(
    data.password[:72], farmer.password):
            raise HTTPException(
                status_code=401,
                detail="Invalid phone number or password"
            )
        token = create_token(data.phone)
        profile = db.query(FarmProfile).filter(
            FarmProfile.phone == data.phone).first()
        return {
            "message": f"Welcome back, {farmer.name}!",
            "token": token,
            "user": {
                "name": farmer.name,
                "phone": farmer.phone,
                "district": farmer.district
            },
            "has_profile": profile is not None
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
    data: FarmProfileRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        existing = db.query(FarmProfile).filter(
            FarmProfile.phone == current_user["phone"]
        ).first()
        if existing:
            existing.crop_type = data.crop_type
            existing.land_size = data.land_size
            existing.soil_type = data.soil_type
            existing.irrigation_type = data.irrigation_type
            existing.sowing_season = data.sowing_season
            existing.district = data.district
            existing.village = data.village
        else:
            profile = FarmProfile(
                phone=current_user["phone"],
                crop_type=data.crop_type,
                land_size=data.land_size,
                soil_type=data.soil_type,
                irrigation_type=data.irrigation_type,
                sowing_season=data.sowing_season,
                district=data.district,
                village=data.village
            )
            db.add(profile)
        db.commit()
        return {"message": "Farm profile saved!"}
    except Exception as e:
        db.rollback()
        print(f"❌ Profile save error: {str(e)}")  # ← shows in terminal
        raise HTTPException(status_code=500, detail=str(e))
# ─────────────────────────────────────────
# ROUTE 5 — Get Profile
# ─────────────────────────────────────────
@app.get("/profile")
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(FarmProfile).filter(
        FarmProfile.phone == current_user["phone"]).first()
    if not profile:
        return {"has_profile": False}
    return {
        "has_profile": True,
        "profile": {
            "crop_type": profile.crop_type,
            "land_size": profile.land_size,
            "soil_type": profile.soil_type,
            "irrigation_type": profile.irrigation_type,
            "sowing_season": profile.sowing_season,
            "district": profile.district,
            "village": profile.village
        }
    }
# ─────────────────────────────────────────
# ROUTE 6 — Predict
# ─────────────────────────────────────────
@app.post("/predict")
def predict(
    data: PredictRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)        # ← added this
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

        # ← NEW: Save prediction to database
        try:
            prediction = RiskPrediction(
                phone=current_user["phone"],
                n_value=data.N,
                p_value=data.P,
                k_value=data.K,
                temperature=data.temperature,
                humidity=data.humidity,
                ph=data.ph,
                rainfall=data.rainfall,
                risk_score=risk_score,
                risk_status=status
            )
            db.add(prediction)
            db.commit()
        except Exception as db_error:
            print(f"DB save error: {db_error}")
            db.rollback()

        return {
            "farmer": current_user["name"],
            "risk_score": risk_score,
            "status": status,
            "color": color,
            "advice": advice,
            "insurance_status": insurance,
            "contributing_factors": factors if factors
                else ["All parameters normal"],
            "timestamp": str(datetime.now())
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# ROUTE 7 — Get Risk History
# ─────────────────────────────────────────
@app.get("/history")
def get_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        predictions = db.query(RiskPrediction).filter(
            RiskPrediction.phone == current_user["phone"]
        ).order_by(
            RiskPrediction.predicted_at.desc()
        ).limit(10).all()

        return {
            "history": [
                {
                    "risk_score": p.risk_score,
                    "risk_status": p.risk_status,
                    "date": str(p.predicted_at)
                }
                for p in predictions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# ROUTE 8 — Generate Insurance Claim
# ─────────────────────────────────────────
@app.post("/claim")
def generate_claim(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get latest prediction
        latest = db.query(RiskPrediction).filter(
            RiskPrediction.phone == current_user["phone"]
        ).order_by(
            RiskPrediction.predicted_at.desc()
        ).first()

        if not latest:
            raise HTTPException(
                status_code=400,
                detail="No prediction found. Run prediction first."
            )

        if latest.risk_score < 60:
            raise HTTPException(
                status_code=400,
                detail="Risk score below 60%. Not eligible for claim."
            )

        # Get farm profile
        profile = db.query(FarmProfile).filter(
            FarmProfile.phone == current_user["phone"]
        ).first()

        # Calculate compensation
        land = profile.land_size if profile else 1.0
        compensation = round(
            10000 * land * (latest.risk_score / 100), 2
        )

        # Save claim to database
        claim = InsuranceClaim(
            phone=current_user["phone"],
            risk_score=latest.risk_score,
            crop_type=profile.crop_type if profile else "Unknown",
            land_size=land,
            compensation=compensation,
            status="PENDING"
        )
        db.add(claim)
        db.commit()
        db.refresh(claim)

        return {
            "message": "Insurance claim generated successfully!",
            "claim": {
                "claim_id": claim.id,
                "farmer": current_user["name"],
                "crop": claim.crop_type,
                "land_size": claim.land_size,
                "risk_score": claim.risk_score,
                "compensation": f"₹{compensation:,.2f}",
                "status": claim.status,
                "date": str(claim.created_at)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))