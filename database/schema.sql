-- SmartCrop Database Schema
-- Sri Krishna College of Technology

-- Table 1: Farmers
CREATE TABLE farmers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    land_size_acres DECIMAL(10,2),
    crop_type VARCHAR(50),
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Crop Records
CREATE TABLE crop_records (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    crop_name VARCHAR(50),
    season VARCHAR(20),
    year INTEGER,
    yield_kg DECIMAL(10,2),
    rainfall_mm DECIMAL(10,2),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    soil_ph DECIMAL(4,2),
    nitrogen DECIMAL(10,2),
    phosphorus DECIMAL(10,2),
    potassium DECIMAL(10,2)
);

-- Table 3: Risk Scores
CREATE TABLE risk_scores (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    risk_score DECIMAL(5,2),
    risk_status VARCHAR(20),
    advice TEXT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Insurance Claims
CREATE TABLE insurance_claims (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES farmers(id),
    risk_score_id INTEGER REFERENCES risk_scores(id),
    claim_amount DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample farmer data
INSERT INTO farmers (name, district, land_size_acres, crop_type, phone)
VALUES 
('Ravi Kumar', 'Coimbatore', 2.5, 'Rice', '9876543210'),
('Murugan S', 'Thanjavur', 5.0, 'Wheat', '9876543211'),
('Selvi R', 'Madurai', 3.0, 'Maize', '9876543212');