from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# ⚠️ Update YOUR_PASSWORD with Tejasri's PostgreSQL password
DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost/smartcrop_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ─────────────────────────────────────────
# TABLE 1 — Farmers
# ─────────────────────────────────────────
class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    phone = Column(String(15), unique=True, index=True)
    district = Column(String(100))
    password = Column(String(255))
    created_at = Column(DateTime, default=datetime.now)

# ─────────────────────────────────────────
# TABLE 2 — Farm Profiles
# ─────────────────────────────────────────
class FarmProfileDB(Base):
    __tablename__ = "farm_profiles"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), index=True)
    crop_type = Column(String(50))
    land_size = Column(Float)
    soil_type = Column(String(50))
    irrigation_type = Column(String(50))
    sowing_season = Column(String(20))
    district = Column(String(100))
    village = Column(String(100))
    created_at = Column(DateTime, default=datetime.now)

# ─────────────────────────────────────────
# TABLE 3 — Risk Predictions
# ─────────────────────────────────────────
class RiskPredictionDB(Base):
    __tablename__ = "risk_predictions"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), index=True)
    n_value = Column(Float)
    p_value = Column(Float)
    k_value = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    ph = Column(Float)
    rainfall = Column(Float)
    risk_score = Column(Float)
    risk_status = Column(String(20))
    advice = Column(Text)
    predicted_at = Column(DateTime, default=datetime.now)

# ─────────────────────────────────────────
# TABLE 4 — Insurance Claims
# ─────────────────────────────────────────
class InsuranceClaimDB(Base):
    __tablename__ = "insurance_claims"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), index=True)
    farmer_name = Column(String(100))
    crop_type = Column(String(50))
    land_size = Column(Float)
    risk_score = Column(Float)
    compensation = Column(Float)
    status = Column(String(20), default="PENDING")
    created_at = Column(DateTime, default=datetime.now)

# ─────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────
def init_db():
    Base.metadata.create_all(engine)
    print("✅ All database tables created!")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()