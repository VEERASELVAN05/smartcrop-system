import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import translations from '../translations';

function Dashboard() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('language') || 'English';
  const t = translations[lang];

  const [form, setForm] = useState({
    N: '', P: '', K: '',
    temperature: '', humidity: '',
    ph: '', rainfall: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    axios.get('http://127.0.0.1:8000/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      if (res.data.has_profile) setProfile(res.data.profile);
    }).catch(() => navigate('/login'));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    for (let key in form) {
      if (!form[key]) { alert(`Please enter ${key}`); return; }
    }
    setLoading(true);
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/predict',
        Object.fromEntries(
          Object.entries(form).map(([k, v]) => [k, parseFloat(v)])
        ),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch {
      alert('Prediction failed. Make sure API is running!');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleChangeLanguage = () => {
    localStorage.removeItem('language');
    navigate('/');
  };

  const getRiskColors = (color) => {
    if (color === 'green') return { bg: '#D1FAE5', border: '#059669', text: '#059669' };
    if (color === 'yellow') return { bg: '#FEF3C7', border: '#D97706', text: '#D97706' };
    return { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' };
  };

  const getRiskLabel = (status) => {
    if (status === 'SAFE') return t.safe;
    if (status === 'MODERATE RISK') return t.moderate;
    return t.high;
  };

  const fields = [
    { name: 'N',           label: 'Nitrogen (N)',      placeholder: 'e.g. 90'  },
    { name: 'P',           label: 'Phosphorus (P)',    placeholder: 'e.g. 42'  },
    { name: 'K',           label: 'Potassium (K)',     placeholder: 'e.g. 43'  },
    { name: 'temperature', label: 'Temperature (°C)',  placeholder: 'e.g. 25'  },
    { name: 'humidity',    label: 'Humidity (%)',      placeholder: 'e.g. 80'  },
    { name: 'ph',          label: 'Soil pH',           placeholder: 'e.g. 6.5' },
    { name: 'rainfall',    label: 'Rainfall (mm)',     placeholder: 'e.g. 200' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA', fontFamily: 'Arial' }}>

      {/* Navbar */}
      <div style={{
        backgroundColor: '#1B2A4A', padding: '15px 25px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '20px' }}>
          🌾 SmartCrop
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#9EC8B9', fontSize: '13px' }}>
            👤 {user.name} | 📍 {user.district}
          </span>
          <button
            onClick={handleChangeLanguage}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #9EC8B9',
              color: '#9EC8B9', padding: '6px 12px',
              borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
            }}
          >
            🌐 {t.changeLanguage}
          </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #9EC8B9',
              color: '#9EC8B9', padding: '6px 12px',
              borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
            }}
          >
            {t.logout}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '750px', margin: '30px auto', padding: '0 20px' }}>

        {/* Farm Profile Banner */}
        {profile && (
          <div style={{
            backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0',
            borderRadius: '12px', padding: '15px 20px',
            marginBottom: '20px',
            display: 'flex', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '10px'
          }}>
            <span style={{ color: '#065F46', fontSize: '13px', fontWeight: 'bold' }}>
              🌾 {profile.crop_type}
            </span>
            <span style={{ color: '#065F46', fontSize: '13px' }}>
              📐 {profile.land_size} acres
            </span>
            <span style={{ color: '#065F46', fontSize: '13px' }}>
              🧪 {profile.soil_type}
            </span>
            <span style={{ color: '#065F46', fontSize: '13px' }}>
              💧 {profile.irrigation_type}
            </span>
            <span style={{ color: '#065F46', fontSize: '13px' }}>
              🌱 {profile.sowing_season}
            </span>
            <span style={{ color: '#065F46', fontSize: '13px' }}>
              📍 {profile.village}, {profile.district}
            </span>
          </div>
        )}

        {/* Input Form */}
        <div style={{
          backgroundColor: 'white', borderRadius: '12px',
          padding: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>
            📊 {t.enterParams}
          </h3>
          <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '-10px' }}>
            {t.enterParamsSub}
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'
          }}>
            {fields.map(f => (
              <div key={f.name}>
                <label style={{
                  fontSize: '13px', fontWeight: 'bold',
                  color: '#374151', display: 'block', marginBottom: '5px'
                }}>
                  {f.label}
                </label>
                <input
                  type="number" name={f.name}
                  value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder}
                  style={{
                    width: '100%', padding: '10px',
                    borderRadius: '8px', border: '1px solid #D1D5DB',
                    fontSize: '14px', boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handlePredict}
            style={{
              width: '100%', padding: '14px', marginTop: '20px',
              backgroundColor: '#1B2A4A', color: 'white',
              border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            {loading ? t.predicting : `🔍 ${t.predict}`}
          </button>
        </div>

        {/* Result Card */}
        {result && (() => {
          const colors = getRiskColors(result.color);
          return (
            <div style={{
              backgroundColor: colors.bg,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px', padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{
                textAlign: 'center', color: '#1B2A4A', marginTop: 0
              }}>
                {t.result}
              </h3>

              {/* Score */}
              <div style={{
                textAlign: 'center', backgroundColor: 'white',
                borderRadius: '10px', padding: '20px', marginBottom: '15px'
              }}>
                <div style={{
                  fontSize: '52px', fontWeight: 'bold', color: colors.text
                }}>
                  {result.risk_score}%
                </div>
                <div style={{
                  fontSize: '20px', fontWeight: 'bold', color: colors.text
                }}>
                  {getRiskLabel(result.status)}
                </div>
              </div>

              {/* Risk Factors */}
              {result.contributing_factors?.length > 0 && (
                <div style={{
                  backgroundColor: 'white', borderRadius: '8px',
                  padding: '12px', marginBottom: '12px'
                }}>
                  <strong style={{ fontSize: '13px', color: '#374151' }}>
                    ⚠️ {t.riskFactors}
                  </strong>
                  {result.contributing_factors.map((f, i) => (
                    <p key={i} style={{
                      margin: '4px 0 0', fontSize: '13px', color: colors.text
                    }}>
                      • {f}
                    </p>
                  ))}
                </div>
              )}

              {/* Advice */}
              <div style={{
                backgroundColor: 'white', borderRadius: '8px',
                padding: '12px', marginBottom: '12px'
              }}>
                <strong style={{ fontSize: '13px' }}>
                  📋 {t.advice}
                </strong>
                <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#374151' }}>
                  {result.advice}
                </p>
              </div>

              {/* Insurance */}
              <div style={{
                backgroundColor: 'white', borderRadius: '8px', padding: '12px'
              }}>
                <strong style={{ fontSize: '13px' }}>
                  🛡️ {t.insurance}
                </strong>
                <p style={{
                  margin: '5px 0 0', fontSize: '13px',
                  color: colors.text, fontWeight: 'bold'
                }}>
                  {result.insurance_status}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <p style={{
          textAlign: 'center', color: '#9CA3AF',
          fontSize: '12px', marginTop: '20px'
        }}>
          Sri Krishna College of Technology | SmartCrop v2.0
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
