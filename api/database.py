from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Update YOUR_PASSWORD with your PostgreSQL password
DATABASE_URL = "postgresql://postgres:12345@localhost/smartcrop_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String, unique=True, index=True)
    district = Column(String)
    password = Column(String)
    created_at = Column(DateTime, default=datetime.now)

class FarmProfile(Base):
    __tablename__ = "farm_profiles"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, index=True)
    crop_type = Column(String)
    land_size = Column(Float)
    soil_type = Column(String)
    irrigation_type = Column(String)
    sowing_season = Column(String)
    district = Column(String)
    village = Column(String)
    created_at = Column(DateTime, default=datetime.now)

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, index=True)
    n_value = Column(Float)
    p_value = Column(Float)
    k_value = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    ph = Column(Float)
    rainfall = Column(Float)
    risk_score = Column(Float)
    risk_status = Column(String)
    predicted_at = Column(DateTime, default=datetime.now)

class InsuranceClaim(Base):
    __tablename__ = "insurance_claims"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, index=True)
    risk_score = Column(Float)
    crop_type = Column(String)
    land_size = Column(Float)
    compensation = Column(Float)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=datetime.now)

def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ All database tables created!")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()