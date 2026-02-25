# SmartCrop Failure Prediction & Micro-Insurance Automation System

## About the Project
SmartCrop is an AI-powered agricultural risk management system that predicts 
crop failure probability before damage occurs and automates micro-insurance 
claim eligibility for smallholder farmers. It integrates machine learning, 
satellite NDVI analytics, weather data, and financial risk modeling into a 
unified dashboard for farmers, insurance companies, and government bodies.

## Team
| Roll Number | Name | Role |
|---|---|---|
| 727823TUCS336 | Tejasri R | Frontend Dashboard & UI |
| 727823TUCS347 | Veeraselvan M | ML Model & Data Pipeline |
| 727823TUCS354 | Vinaiprasat V K | Backend API & Database |

## Guide
**Ms. S. Vidhya** — Assistant Professor, Department of CSE  
Sri Krishna College of Technology, Coimbatore

## Tech Stack
- Python, scikit-learn, XGBoost, TensorFlow
- FastAPI, PostgreSQL
- React.js, Recharts
- Open-Meteo API, MODIS NDVI API

## Project Structure
```
smartcrop-system/
├── data/
│   ├── raw/          ← Original datasets
│   └── processed/    ← Cleaned datasets
├── notebooks/        ← Jupyter notebooks
├── models/           ← Saved ML models
├── api/              ← FastAPI backend
├── database/         ← SQL schema
├── tests/            ← Unit tests
└── docs/             ← Reports
```

## Setup Instructions
```bash
pip install pandas numpy matplotlib seaborn scikit-learn xgboost fastapi uvicorn
```