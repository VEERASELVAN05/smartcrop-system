import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import translations from '../translations';
import cropRecommendation from '../cropRecommendation';
import { getSoilValues } from '../soilData';
import generateReport from '../generateReport';


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
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [activeTab, setActiveTab] = useState('predict');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // District to coordinates mapping
  const districtCoords = {
    'Coimbatore':  { lat: 11.0168, lon: 76.9558 },
    'Chennai':     { lat: 13.0827, lon: 80.2707 },
    'Madurai':     { lat: 9.9252,  lon: 78.1198 },
    'Thanjavur':   { lat: 10.7870, lon: 79.1378 },
    'Salem':       { lat: 11.6643, lon: 78.1460 },
    'Tirunelveli': { lat: 8.7139,  lon: 77.7567 },
    'Trichy':      { lat: 10.7905, lon: 78.7047 },
    'Erode':       { lat: 11.3410, lon: 77.7172 },
    'Tiruppur':    { lat: 11.1085, lon: 77.3411 },
    'Vellore':     { lat: 12.9165, lon: 79.1325 },
    'Dindigul':    { lat: 10.3673, lon: 77.9803 },
    'Kanchipuram': { lat: 12.8185, lon: 79.6947 },
  };

  useEffect(() => {
  if (!token) { navigate('/login'); return; }
  axios.get('http://127.0.0.1:8000/profile', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => {
    if (res.data.has_profile) {
      setProfile(res.data.profile);
      fetchWeather(res.data.profile.district);

      // Auto fill N, P, K, pH from crop + soil type
      const soilVals = getSoilValues(
        res.data.profile.crop_type,
        res.data.profile.soil_type
      );
      setForm(prev => ({
        ...prev,
        N: soilVals.N.toString(),
        P: soilVals.P.toString(),
        K: soilVals.K.toString(),
        ph: soilVals.ph.toString()
      }));
      console.log("✅ Soil values auto-filled:", soilVals);
    }
  }).catch(() => navigate('/login'));

  // Load history
  const savedHistory = JSON.parse(
    localStorage.getItem('predictionHistory') || '[]'
  );
  setHistory(savedHistory);
}, []);

  const fetchWeather = async (district) => {
    setWeatherLoading(true);
    try {
      const coords = districtCoords[district] ||
                     { lat: 11.0168, lon: 76.9558 };
      const res = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weathercode&timezone=Asia/Kolkata`
      );
      const curr = res.data.current;
      setWeather({
        temperature: curr.temperature_2m,
        humidity: curr.relative_humidity_2m,
        rainfall: curr.precipitation,
        windSpeed: curr.wind_speed_10m,
        condition: getWeatherCondition(curr.weathercode),
        emoji: getWeatherEmoji(curr.weathercode)
      });
    } catch {
      setWeather(null);
    }
    setWeatherLoading(false);
  };

  const getWeatherCondition = (code) => {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 49) return 'Foggy';
    if (code <= 69) return 'Drizzle';
    if (code <= 79) return 'Rain';
    if (code <= 99) return 'Thunderstorm';
    return 'Unknown';
  };

  const getWeatherEmoji = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 49) return '🌫️';
    if (code <= 69) return '🌦️';
    if (code <= 79) return '🌧️';
    if (code <= 99) return '⛈️';
    return '🌤️';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Auto fill weather values
  const handleAutoFill = () => {
  if (!weather) return;
  setForm(prev => ({
    ...prev,
    temperature: weather.temperature.toString(),
    humidity: weather.humidity.toString(),
    rainfall: weather.rainfall.toString()
  }));
  alert('✅ Weather values auto-filled!');
};

  const handlePredict = async () => {
    for (let key in form) {
      if (!form[key]) { alert(`Please enter ${key}`); return; }
    }
    setLoading(true);
    try {
      const values = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, parseFloat(v)])
      );
      const res = await axios.post(
        'http://127.0.0.1:8000/predict',
        values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);

      // Get crop recommendations
      const recs = cropRecommendation(
        values.N, values.P, values.K,
        values.temperature, values.humidity,
        values.ph, values.rainfall
      );
      setRecommendations(recs);

      // Save to history
      const newEntry = {
        time: new Date().toLocaleTimeString('en-IN',
          { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN'),
        risk: res.data.risk_score,
        status: res.data.status
      };
      const updatedHistory = [...history, newEntry].slice(-7);
      setHistory(updatedHistory);
      localStorage.setItem('predictionHistory',
        JSON.stringify(updatedHistory));

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
    // Only remove language — keep token and user data
    localStorage.removeItem('language');
    // Clear any cached translations
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('translations_')) {
        localStorage.removeItem(key);
      }
    });
    navigate('/language');
  };

  const getRiskColors = (color) => {
    if (color === 'green')
      return { bg: '#D1FAE5', border: '#059669', text: '#059669' };
    if (color === 'yellow')
      return { bg: '#FEF3C7', border: '#D97706', text: '#D97706' };
    return { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' };
  };

  const getRiskLabel = (status) => {
    if (status === 'SAFE') return t.safe;
    if (status === 'MODERATE RISK') return t.moderate;
    return t.high;
  };

  const fields = [
    { name: 'N',           label: 'Nitrogen (N)',     placeholder: 'e.g. 90'  },
    { name: 'P',           label: 'Phosphorus (P)',   placeholder: 'e.g. 42'  },
    { name: 'K',           label: 'Potassium (K)',    placeholder: 'e.g. 43'  },
    { name: 'temperature', label: 'Temperature (°C)', placeholder: 'e.g. 25'  },
    { name: 'humidity',    label: 'Humidity (%)',     placeholder: 'e.g. 80'  },
    { name: 'ph',          label: 'Soil pH',          placeholder: 'e.g. 6.5' },
    { name: 'rainfall',    label: 'Rainfall (mm)',    placeholder: 'e.g. 200' },
  ];

  const tabStyle = (tab) => ({
    padding: '10px 20px',
    backgroundColor: activeTab === tab ? '#1B2A4A' : '#F3F4F6',
    color: activeTab === tab ? 'white' : '#374151',
    border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 'bold',
    fontSize: '13px'
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F7FA',
      fontFamily: 'Arial'
    }}>

      {/* Navbar */}
      <div style={{
        backgroundColor: '#1B2A4A',
        padding: '12px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🌾</span>
          <div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
              SmartCrop
            </div>
            <div style={{ color: '#9EC8B9', fontSize: '11px' }}>
              AI Crop Protection System
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#9EC8B9', fontSize: '12px' }}>
            👤 {user.name}
          </span>

          <button
            onClick={() => navigate('/chatbot')}
            style={{
              backgroundColor: '#2C7A3F',
              border: 'none',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            🤖 AI Assistant
          </button>

          <button
          onClick={() => navigate('/government')}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #9EC8B9',
            color: '#9EC8B9', padding: '5px 10px',
            borderRadius: '6px', cursor: 'pointer',
            fontSize: '11px'
            }}
          >
            🏛️ Govt View
          </button>

          <button
  onClick={() => navigate('/insurance-company')}
  style={{
    backgroundColor: 'transparent',
    border: '1px solid #9EC8B9',
    color: '#9EC8B9', padding: '5px 10px',
    borderRadius: '6px', cursor: 'pointer',
    fontSize: '11px'
  }}
>
  🏢 Insurance Co.
</button>

          <button
            onClick={handleChangeLanguage}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #9EC8B9',
              color: '#9EC8B9', padding: '5px 10px',
              borderRadius: '6px', cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            🌐 {t.changeLanguage}
          </button>

          <button
  onClick={async () => {
    try {
      const res = await axios.get(
        'http://127.0.0.1:8000/history',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      generateReport(user, profile, res.data.history);
    } catch {
      generateReport(user, profile, []);
    }
  }}
  style={{
    backgroundColor: '#2C7A3F',
    border: 'none', color: 'white',
    padding: '5px 10px', borderRadius: '6px',
    cursor: 'pointer', fontSize: '11px',
    fontWeight: 'bold'
  }}
>
  📄 Download Report
</button>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #9EC8B9',
              color: '#9EC8B9', padding: '5px 10px',
              borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            {t.logout}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '20px auto', padding: '0 15px' }}>

        {/* Farm Profile Banner */}
        {profile && (
          <div style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '12px',
            padding: '12px 20px',
            marginBottom: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '8px'
          }}>
            {[
              { icon: '🌾', val: profile.crop_type },
              { icon: '📐', val: `${profile.land_size} acres` },
              { icon: '🧪', val: profile.soil_type },
              { icon: '💧', val: profile.irrigation_type },
              { icon: '🌱', val: profile.sowing_season },
              { icon: '📍', val: `${profile.village}, ${profile.district}` },
            ].map((item, i) => (
              <span key={i} style={{
                color: '#065F46', fontSize: '12px', fontWeight: 'bold'
              }}>
                {item.icon} {item.val}
              </span>
            ))}
          </div>
        )}

        {/* Weather Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '15px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, color: '#1B2A4A', fontSize: '16px' }}>
              🌤️ Today's Weather — {profile?.district || user.district}
            </h3>
            {weather && (
              <button
                onClick={handleAutoFill}
                style={{
                backgroundColor: '#2C7A3F',
                color: 'white', border: 'none',
                borderRadius: '8px', padding: '7px 14px',
                cursor: 'pointer', fontSize: '12px',
                fontWeight: 'bold'
                }}
              >
              ⚡ Auto-fill Weather Values
              </button>
            )}
          </div>

          {weatherLoading && (
            <p style={{ color: '#6B7280', fontSize: '13px' }}>
              Loading weather...
            </p>
          )}

          {weather && !weatherLoading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px'
            }}>
              {[
                { icon: weather.emoji, label: 'Condition',    val: weather.condition },
                { icon: '🌡️',         label: 'Temperature',  val: `${weather.temperature}°C` },
                { icon: '💧',         label: 'Humidity',     val: `${weather.humidity}%` },
                { icon: '🌧️',         label: 'Rainfall',     val: `${weather.rainfall}mm` },
              ].map((w, i) => (
                <div key={i} style={{
                  backgroundColor: '#F0F9FF',
                  borderRadius: '10px',
                  padding: '12px',
                  textAlign: 'center',
                  border: '1px solid #BAE6FD'
                }}>
                  <div style={{ fontSize: '22px' }}>{w.icon}</div>
                  <div style={{
                    fontSize: '16px', fontWeight: 'bold',
                    color: '#1B2A4A', margin: '4px 0'
                  }}>
                    {w.val}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>
                    {w.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!weather && !weatherLoading && (
            <p style={{ color: '#9CA3AF', fontSize: '13px' }}>
              ⚠️ Weather data unavailable. Check internet connection.
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            style={tabStyle('predict')}
            onClick={() => setActiveTab('predict')}
          >
            🔍 Risk Prediction
          </button>
          <button
            style={tabStyle('history')}
            onClick={() => setActiveTab('history')}
          >
            📈 Risk History
          </button>
          <button
            style={tabStyle('recommend')}
            onClick={() => setActiveTab('recommend')}
          >
            🌱 Crop Recommendation
          </button>
        </div>

        {/* TAB 1 — Prediction */}
        {activeTab === 'predict' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            marginBottom: '15px'
          }}>
            <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>
              📊 {t.enterParams}
            </h3>
            <p style={{
              color: '#6B7280', fontSize: '13px', marginTop: '-10px'
            }}>
              {t.enterParamsSub}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              {fields.map(f => (
                <div key={f.name}>
                  <label style={{
                    fontSize: '13px', fontWeight: 'bold',
                    color: '#374151', display: 'block',
                    marginBottom: '5px'
                  }}>
                    {f.label}
                  </label>
                  <input
                    type="number" name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handlePredict}
              style={{
                width: '100%', padding: '14px',
                marginTop: '20px',
                backgroundColor: '#1B2A4A',
                color: 'white', border: 'none',
                borderRadius: '8px', fontSize: '16px',
                fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {loading ? t.predicting : `🔍 ${t.predict}`}
            </button>
          </div>
        )}

        {/* Result Card */}
        {activeTab === 'predict' && result && (() => {
          const colors = getRiskColors(result.color);
          return (
            <div style={{
              backgroundColor: colors.bg,
              border: `2px solid ${colors.border}`,
              borderRadius: '12px', padding: '25px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{
                textAlign: 'center', color: '#1B2A4A', marginTop: 0
              }}>
                {t.result}
              </h3>

              {/* Score */}
              <div style={{
                textAlign: 'center', backgroundColor: 'white',
                borderRadius: '10px', padding: '20px',
                marginBottom: '15px'
              }}>
                <div style={{
                  fontSize: '56px', fontWeight: 'bold',
                  color: colors.text
                }}>
                  {result.risk_score}%
                </div>
                <div style={{
                  fontSize: '22px', fontWeight: 'bold',
                  color: colors.text
                }}>
                  {getRiskLabel(result.status)}
                </div>
                <div style={{
                  fontSize: '12px', color: '#9CA3AF', marginTop: '5px'
                }}>
                  Farmer: {result.farmer}
                </div>
              </div>

              {/* 3 info cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '10px'
              }}>
                <div style={{
                  backgroundColor: 'white', borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 'bold',
                    color: '#6B7280', marginBottom: '5px'
                  }}>
                    ⚠️ {t.riskFactors}
                  </div>
                  {result.contributing_factors?.map((f, i) => (
                    <p key={i} style={{
                      margin: '3px 0', fontSize: '11px',
                      color: colors.text
                    }}>
                      • {f}
                    </p>
                  ))}
                </div>
                <div style={{
                  backgroundColor: 'white', borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 'bold',
                    color: '#6B7280', marginBottom: '5px'
                  }}>
                    📋 {t.advice}
                  </div>
                  <p style={{
                    margin: 0, fontSize: '11px', color: '#374151'
                  }}>
                    {result.advice}
                  </p>
                </div>
                <div style={{
                  backgroundColor: 'white', borderRadius: '8px',
                  padding: '12px'
                }}>
                  <div style={{
                    fontSize: '11px', fontWeight: 'bold',
                    color: '#6B7280', marginBottom: '5px'
                  }}>
                    🛡️ {t.insurance}
                  </div>
                  <p style={{
                    margin: 0, fontSize: '11px',
                    color: colors.text, fontWeight: 'bold'
                  }}>
                    {result.insurance_status}
                  </p>

                </div>
                {result && result.color === 'red' && (
  <button
    onClick={() => navigate('/insurance')}
    style={{
      width: '100%', padding: '12px',
      marginTop: '12px',
      backgroundColor: '#DC2626',
      color: 'white', border: 'none',
      borderRadius: '8px', fontSize: '14px',
      fontWeight: 'bold', cursor: 'pointer'
    }}
  >
    📋 Generate Insurance Claim →
  </button>
)}
              </div>
            </div>
          );
        })()}

        {/* TAB 2 — Risk History Chart */}
        {activeTab === 'history' && (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>
              📈 Risk Score History
            </h3>

            {history.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px',
                color: '#9CA3AF'
              }}>
                <div style={{ fontSize: '40px' }}>📊</div>
                <p>No predictions yet.</p>
                <p style={{ fontSize: '13px' }}>
                  Make a prediction to see your risk history chart!
                </p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#6B7280' }}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Risk Score']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      stroke="#1B2A4A"
                      strokeWidth={3}
                      dot={{ fill: '#2C7A3F', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 7, fill: '#F4A623' }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* History table */}
                <div style={{ marginTop: '15px' }}>
                  {history.map((h, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: i % 2 === 0 ? '#F9FAFB' : 'white',
                      borderRadius: '6px',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        {h.date} {h.time}
                      </span>
                      <span style={{
                        fontSize: '13px', fontWeight: 'bold',
                        color: h.risk > 60 ? '#DC2626' :
                               h.risk > 30 ? '#D97706' : '#059669'
                      }}>
                        {h.risk}% — {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3 — Crop Recommendation */}
        {activeTab === 'recommend' && (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>
              🌱 Crop Recommendation
            </h3>

            {recommendations.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px', color: '#9CA3AF'
              }}>
                <div style={{ fontSize: '40px' }}>🌾</div>
                <p>No recommendations yet.</p>
                <p style={{ fontSize: '13px' }}>
                  Make a prediction first to get crop recommendations
                  based on your soil and weather values!
                </p>
              </div>
            ) : (
              <div>
                <p style={{
                  color: '#6B7280', fontSize: '13px',
                  marginBottom: '20px'
                }}>
                  Based on your soil values and weather conditions,
                  here are the best crops for your farm:
                </p>
                {recommendations.map((rec, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '15px',
                    padding: '16px',
                    backgroundColor: i === 0 ? '#ECFDF5' : '#F9FAFB',
                    border: `1px solid ${i === 0 ? '#A7F3D0' : '#E5E7EB'}`,
                    borderRadius: '10px',
                    marginBottom: '10px'
                  }}>
                    <div style={{ fontSize: '36px' }}>{rec.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '16px', fontWeight: 'bold',
                          color: '#1B2A4A'
                        }}>
                          {i === 0 && '⭐ '}{rec.crop}
                        </span>
                        <span style={{
                          fontSize: '11px', fontWeight: 'bold',
                          padding: '3px 10px', borderRadius: '20px',
                          backgroundColor:
                            rec.confidence === 'High' ? '#D1FAE5' :
                            rec.confidence === 'Medium' ? '#FEF3C7' : '#FEE2E2',
                          color:
                            rec.confidence === 'High' ? '#065F46' :
                            rec.confidence === 'Medium' ? '#92400E' : '#991B1B'
                        }}>
                          {rec.confidence} Match
                        </span>
                      </div>
                      <p style={{
                        margin: '5px 0 0', fontSize: '13px',
                        color: '#6B7280'
                      }}>
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                ))}

                <div style={{
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FED7AA',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '15px'
                }}>
                  <p style={{
                    margin: 0, fontSize: '12px', color: '#92400E'
                  }}>
                    💡 <strong>Note:</strong> These recommendations are
                    based on your entered soil and weather values.
                    For best results consult your local Krishi Vigyan
                    Kendra (KVK).
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p style={{
          textAlign: 'center', color: '#9CA3AF',
          fontSize: '12px', marginTop: '15px', marginBottom: '30px'
        }}>
          Sri Krishna College of Technology | SmartCrop v2.0
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
