import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import translations from '../translations';
import { getOptions } from '../optionTranslations';
import optionTranslations from '../optionTranslations';


function FarmProfile() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('language') || 'English';
  const t = translations[lang];
  const options = getOptions(lang);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    crop_type: '', land_size: '',
    soil_type: '', irrigation_type: '',
    sowing_season: '', district: '', village: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    console.log('Token:', token); // ← debug check

    if (!token) {
      alert('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    await axios.post(
      'http://127.0.0.1:8000/profile',
      { ...form, land_size: parseFloat(form.land_size) },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    navigate('/dashboard');
  } catch (err) {
    console.log('Error:', err.response?.data);
    if (err.response?.status === 401) {
      alert('Session expired. Please login again.');
      localStorage.clear();
      navigate('/login');
    } else {
      alert('Error saving profile. Please try again.');
    }
  }
  setLoading(false);
};

  const selectStyle = {
    width: '100%', padding: '12px',
    borderRadius: '8px', border: '1px solid #D1D5DB',
    fontSize: '14px', backgroundColor: 'white',
    marginTop: '8px', boxSizing: 'border-box'
  };

  const crops = options.crops;
  const soils = options.soils;
  const irrigations = options.irrigations;

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F5F7FA',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Arial', padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        padding: '40px', width: '480px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '40px' }}>🌱</div>
          <h2 style={{ color: '#1B2A4A', margin: '8px 0 4px' }}>
            {t.farmTitle}
          </h2>
          <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>
            {t.farmSub} — {user.name}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              flex: 1, height: '6px', borderRadius: '3px',
              backgroundColor: n <= step ? '#2C7A3F' : '#E5E7EB'
            }} />
          ))}
        </div>
        <p style={{
          textAlign: 'center', color: '#6B7280',
          fontSize: '13px', marginBottom: '25px'
        }}>
          {t.stepOf} {step} {t.of} 3
        </p>

        {/* Step 1 — Crop Info */}
        {step === 1 && (
          <div>
            <h3 style={{ color: '#1B2A4A', marginBottom: '20px' }}>
              🌾 {t.whatGrow}
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                {t.cropType}
              </label>
              <select
                name="crop_type" value={form.crop_type}
                onChange={handleChange} style={selectStyle}
              >
                <option value="">{t.selectCrop}</option>
                {crops.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                {t.landSize}
              </label>
              <input
                type="number" name="land_size"
                value={form.land_size} onChange={handleChange}
                placeholder="e.g. 2.5"
                style={{ ...selectStyle, backgroundColor: 'white' }}
              />
            </div>
          </div>
        )}

        {/* Step 2 — Soil & Irrigation */}
        {step === 2 && (
          <div>
            <h3 style={{ color: '#1B2A4A', marginBottom: '20px' }}>
              🧪 {t.aboutSoil}
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                {t.soilType}
              </label>
              <select
                name="soil_type" value={form.soil_type}
                onChange={handleChange} style={selectStyle}
              >
                <option value="">{t.selectSoil}</option>
                {soils.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                {t.irrigationType}
              </label>
              <select
                name="irrigation_type" value={form.irrigation_type}
                onChange={handleChange} style={selectStyle}
              >
                <option value="">{t.selectIrrigation}</option>
                {irrigations.map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3 — Season & Location */}
        {step === 3 && (
          <div>
            <h3 style={{ color: '#1B2A4A', marginBottom: '20px' }}>
              📍 {t.seasonLocation}
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                {t.sowingSeason}
              </label>
              <select
                name="sowing_season"
                value={form.sowing_season}
                onChange={handleChange}
                style={selectStyle}
              >
              <option value="">{t.selectSeason}</option>
              {options.seasons.map((season, i) => (
                <option
                  key={options.seasonValues[i]}
                  value={options.seasonValues[i]}
                >
                  {season}
                </option>
              ))}
            </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                📍 {t.district}
              </label>
              <select
                name="district"
                value={form.district}
                onChange={handleChange}
                style={selectStyle}
              >
              <option value="">
                {lang === 'Tamil' ? 'மாவட்டத்தை தேர்ந்தெடுக்கவும்' :
                lang === 'Hindi' ? 'जिला चुनें' :
                lang === 'Telugu' ? 'జిల్లా ఎంచుకోండి' :
                lang === 'Malayalam' ? 'ജില്ല തിരഞ്ഞെടുക്കുക' :
                lang === 'Kannada' ? 'ಜಿಲ್ಲೆ ಆಯ್ಕೆ ಮಾಡಿ' :
                'Select district'}
              </option>
              {options.districts.map((d, i) => (
                <option
                  key={optionTranslations['English'].districts[i]}
                  value={optionTranslations['English'].districts[i]}
                >
                  {d}
                </option>
              ))}
            </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '14px' }}>
                🏘️ {t.village}
              </label>
              <input
                type="text" name="village"
                value={form.village} onChange={handleChange}
                placeholder={t.villagePlaceholder}
                style={{ ...selectStyle, backgroundColor: 'white' }}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '25px' }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1, padding: '12px',
                backgroundColor: '#F3F4F6', color: '#374151',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              {t.back}
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              style={{
                flex: 1, padding: '12px',
                backgroundColor: '#1B2A4A', color: 'white',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              {t.next}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                flex: 1, padding: '12px',
                backgroundColor: '#2C7A3F', color: 'white',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              {loading ? t.saving : `✅ ${t.saveProfile}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FarmProfile;