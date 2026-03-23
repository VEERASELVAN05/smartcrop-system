import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import translations from '../translations';
import { getSoilValues } from '../soilData';
import cropRecommendation from '../cropRecommendation';
import { theme } from '../theme';
import {
  PrimaryButton, StatCard,
  Navbar, NavButton, Spinner, Badge
} from '../components/UI';

function Dashboard() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('language') || 'English';
  const t = translations[lang] || translations['English'];

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
  const [pageLoading, setPageLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  );
  const token = localStorage.getItem('token');

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
    loadDashboard();
  }, []);

  

  const loadDashboard = async () => {
    setPageLoading(true);
    try {
      const res = await axios.get(
        'http://127.0.0.1:8000/profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.has_profile) {
        setProfile(res.data.profile);
        fetchWeather(res.data.profile.district);
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
      }

      // Load history
      try {
        const histRes = await axios.get(
          'http://127.0.0.1:8000/history',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHistory(histRes.data.history || []);
      } catch { }

    } catch {
      navigate('/login');
    }
    setPageLoading(false);
  };

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
    } catch { }
    setWeatherLoading(false);
  };

  const getWeatherCondition = (code) => {
    if (code === 0) return 'Clear Sky';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 49) return 'Foggy';
    if (code <= 69) return 'Drizzle';
    if (code <= 79) return 'Rain';
    return 'Thunderstorm';
  };

  const getWeatherEmoji = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 49) return '🌫️';
    if (code <= 69) return '🌦️';
    if (code <= 79) return '🌧️';
    return '⛈️';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAutoFill = () => {
    if (!weather) return;
    setForm(prev => ({
      ...prev,
      temperature: weather.temperature.toString(),
      humidity: weather.humidity.toString(),
      rainfall: weather.rainfall.toString()
    }));
  };

  const handlePredict = async () => {
    for (let key in form) {
      if (!form[key]) {
        alert(`Please enter ${key}`); return;
      }
    }
    setLoading(true);
    try {
      const values = Object.fromEntries(
        Object.entries(form).map(
          ([k, v]) => [k, parseFloat(v)]
        )
      );
      const res = await axios.post(
        'http://127.0.0.1:8000/predict', values,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
      setActiveTab('predict');

      const recs = cropRecommendation(
        values.N, values.P, values.K,
        values.temperature, values.humidity,
        values.ph, values.rainfall
      );
      setRecommendations(recs);

      // Update history
      const newEntry = {
        time: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit'
        }),
        date: new Date().toLocaleDateString('en-IN'),
        risk_score: res.data.risk_score,
        risk_status: res.data.status
      };
      setHistory(prev => [...prev, newEntry].slice(-7));

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
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('translations_'))
        localStorage.removeItem(key);
    });
    navigate('/language');
  };

  const getRiskColors = (color) => {
    if (color === 'green') return {
      bg: '#f0fdf4', border: '#22c55e',
      text: '#15803d', badge: 'success'
    };
    if (color === 'yellow') return {
      bg: '#fffbeb', border: '#f59e0b',
      text: '#b45309', badge: 'warning'
    };
    return {
      bg: '#fef2f2', border: '#ef4444',
      text: '#b91c1c', badge: 'danger'
    };
  };

  const getRiskLabel = (status) => {
    if (status === 'SAFE') return t.safe;
    if (status === 'MODERATE RISK') return t.moderate;
    return t.high;
  };

  const fields = [
    { name: 'N',           label: 'Nitrogen (N)',     ph: 'e.g. 90'  },
    { name: 'P',           label: 'Phosphorus (P)',   ph: 'e.g. 42'  },
    { name: 'K',           label: 'Potassium (K)',    ph: 'e.g. 43'  },
    { name: 'temperature', label: 'Temperature (°C)', ph: 'e.g. 25'  },
    { name: 'humidity',    label: 'Humidity (%)',     ph: 'e.g. 80'  },
    { name: 'ph',          label: 'Soil pH',          ph: 'e.g. 6.5' },
    { name: 'rainfall',    label: 'Rainfall (mm)',    ph: 'e.g. 200' },
  ];

  if (pageLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            🌾
          </div>
          <div style={{
            width: '40px', height: '40px',
            border: `3px solid ${theme.colors.border}`,
            borderTop: `3px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <p style={{ color: theme.colors.textMuted }}>
            Loading SmartCrop...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      fontFamily: "'Segoe UI', sans-serif"
    }}>

      {/* Navbar */}
      <Navbar
        icon="🌾"
        title="SmartCrop"
        subtitle="AI Crop Protection System"
        buttons={
          <>
            <NavButton onClick={() => navigate('/chatbot')}>
              🤖 AI Chat
            </NavButton>
            <NavButton onClick={() => navigate('/insurance')}>
              🛡️ Insurance
            </NavButton>
            <NavButton onClick={() => navigate('/government')}>
              🏛️ Govt
            </NavButton>
            <NavButton
              onClick={() => navigate('/insurance-company')}
            >
              🏢 Insurer
            </NavButton>
            <NavButton onClick={handleChangeLanguage}>
              🌐 {lang}
            </NavButton>
            <div style={{ position: 'relative' }}>
  <button
    onClick={() => setShowUserMenu(!showUserMenu)}
    style={{
      backgroundColor: 'rgba(255,255,255,0.15)',
      border: '1.5px solid rgba(255,255,255,0.4)',
      color: 'white', padding: '6px 14px',
      borderRadius: '9999px', cursor: 'pointer',
      fontSize: '12px', fontWeight: '600',
      display: 'flex', alignItems: 'center', gap: '6px',
      transition: 'all 0.2s ease'
    }}
  >
    👤 {user.name?.split(' ')[0]}
    <span style={{
      fontSize: '10px',
      transform: showUserMenu
        ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
      display: 'inline-block'
    }}>
      ▼
    </span>
  </button>

  {/* Dropdown Menu */}
  {showUserMenu && (
    <div style={{
      position: 'absolute', top: '42px', right: 0,
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      border: `1px solid ${theme.colors.border}`,
      minWidth: '200px', zIndex: 1000,
      animation: 'fadeIn 0.2s ease',
      overflow: 'hidden'
    }}>

      {/* User Info */}
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: '#f8fafc'
      }}>
        <p style={{
          fontWeight: '700', fontSize: '14px',
          color: theme.colors.textPrimary, margin: '0 0 2px'
        }}>
          👤 {user.name}
        </p>
        <p style={{
          fontSize: '12px', color: theme.colors.textMuted,
          margin: 0
        }}>
          📍 {user.district}
        </p>
        {profile && (
          <p style={{
            fontSize: '12px', color: theme.colors.textMuted,
            margin: '2px 0 0'
          }}>
            🌾 {profile.crop_type} • {profile.land_size} acres
          </p>
        )}
      </div>

      {/* Menu Items */}
      {[
        { icon: '🛡️', label: 'Insurance', 
          action: () => navigate('/insurance') },
        { icon: '🏛️', label: 'Govt Dashboard',
          action: () => navigate('/government') },
        { icon: '🏢', label: 'Insurance Co.',
          action: () => navigate('/insurance-company') },
        { icon: '🤖', label: 'AI Assistant',
          action: () => navigate('/chatbot') },
        { icon: '🌐', label: `Language (${lang})`,
          action: handleChangeLanguage },
      ].map((item, i) => (
        <button
          key={i}
          onClick={() => {
            setShowUserMenu(false);
            item.action();
          }}
          style={{
            width: '100%', padding: '10px 16px',
            backgroundColor: 'transparent',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            gap: '10px', fontSize: '13px',
            color: theme.colors.textPrimary,
            textAlign: 'left',
            transition: 'background 0.15s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={e =>
            e.currentTarget.style.backgroundColor = '#f0f4f8'}
          onMouseLeave={e =>
            e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{ fontSize: '16px' }}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* Divider */}
      <div style={{
        borderTop: `1px solid ${theme.colors.border}`
      }} />

      {/* Logout */}
      <button
        onClick={() => {
          setShowUserMenu(false);
          handleLogout();
        }}
        style={{
          width: '100%', padding: '10px 16px',
          backgroundColor: 'transparent',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
          gap: '10px', fontSize: '13px',
          color: '#dc2626', textAlign: 'left',
          transition: 'background 0.15s ease',
          fontFamily: 'inherit', fontWeight: '600'
        }}
        onMouseEnter={e =>
          e.currentTarget.style.backgroundColor = '#fff5f5'}
        onMouseLeave={e =>
          e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span style={{ fontSize: '16px' }}>🚪</span>
        Logout
      </button>
    </div>
  )}
</div>
          </>
        }
      />

      {/* Main Layout — Two columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: '16px',
        padding: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden'
      }}>

        {/* LEFT COLUMN */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: '12px', overflowY: 'auto',
          paddingRight: '4px'
        }}>

          {/* Farm Profile Card */}
          {profile && (
            <div style={{
              background: `linear-gradient(135deg,
                ${theme.colors.secondary} 0%,
                #1a5c32 100%)`,
              borderRadius: theme.radius.lg,
              padding: '16px',
              animation: 'fadeIn 0.4s ease'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: '10px'
              }}>
                <div>
                  <p style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '11px', fontWeight: '600',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Farm Profile
                  </p>
                  <p style={{
                    color: 'white', fontWeight: '700',
                    fontSize: '15px'
                  }}>
                    {user.name}
                  </p>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: '8px', padding: '6px 10px',
                  fontSize: '11px', color: 'white',
                  fontWeight: '600'
                }}>
                  🌾 {profile.crop_type}
                </div>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '6px'
              }}>
                {[
                  { icon: '📐', val: `${profile.land_size} acres` },
                  { icon: '🧪', val: profile.soil_type },
                  { icon: '💧', val: profile.irrigation_type },
                  { icon: '📍', val: profile.village },
                ].map((item, i) => (
                  <div key={i} style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px', padding: '6px 10px',
                    fontSize: '12px', color: 'white',
                    display: 'flex', alignItems: 'center',
                    gap: '6px'
                  }}>
                    {item.icon} {item.val}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weather Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: theme.radius.lg,
            padding: '16px',
            boxShadow: theme.shadows.md,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '12px'
            }}>
              <p style={{
                fontWeight: '700', fontSize: '13px',
                color: theme.colors.textPrimary
              }}>
                🌤️ Live Weather —{' '}
                {profile?.district || user.district}
              </p>
              {weather && (
                <button
                  onClick={handleAutoFill}
                  style={{
                    backgroundColor: theme.colors.secondary,
                    color: 'white', border: 'none',
                    borderRadius: '20px', padding: '4px 10px',
                    cursor: 'pointer', fontSize: '11px',
                    fontWeight: '600'
                  }}
                >
                  ⚡ Auto-fill
                </button>
              )}
            </div>

            {weatherLoading && (
              <p style={{
                color: theme.colors.textMuted,
                fontSize: '12px', textAlign: 'center'
              }}>
                Loading weather...
              </p>
            )}

            {weather && !weatherLoading && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                {[
                  { icon: weather.emoji,
                    label: 'Condition',
                    val: weather.condition },
                  { icon: '🌡️',
                    label: 'Temperature',
                    val: `${weather.temperature}°C` },
                  { icon: '💧',
                    label: 'Humidity',
                    val: `${weather.humidity}%` },
                  { icon: '🌧️',
                    label: 'Rainfall',
                    val: `${weather.rainfall}mm` },
                ].map((w, i) => (
                  <div key={i} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '10px', padding: '10px',
                    textAlign: 'center',
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    <div style={{ fontSize: '18px' }}>
                      {w.icon}
                    </div>
                    <div style={{
                      fontSize: '14px', fontWeight: '700',
                      color: theme.colors.textPrimary,
                      margin: '2px 0'
                    }}>
                      {w.val}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: theme.colors.textMuted
                    }}>
                      {w.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input Form */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: theme.radius.lg,
            padding: '16px',
            boxShadow: theme.shadows.md,
            border: `1px solid ${theme.colors.border}`,
            flex: 1
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '12px'
            }}>
              <p style={{
                fontWeight: '700', fontSize: '13px',
                color: theme.colors.textPrimary
              }}>
                📊 {t.enterParams}
              </p>
            </div>

            {/* Auto-fill note */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px', padding: '8px 12px',
              marginBottom: '12px', fontSize: '11px',
              color: '#15803d'
            }}>
              ✅ N, P, K, pH auto-filled from your profile.
              Click ⚡ Auto-fill above for weather values.
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px', marginBottom: '14px'
            }}>
              {fields.map(f => (
                <div key={f.name}>
                  <label style={{
                    fontSize: '11px', fontWeight: '600',
                    color: theme.colors.textSecondary,
                    display: 'block', marginBottom: '4px'
                  }}>
                    {f.label}
                  </label>
                  <input
                    type="number"
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.ph}
                    style={{
                      width: '100%', padding: '8px 10px',
                      borderRadius: '8px',
                      border: `1.5px solid ${theme.colors.border}`,
                      fontSize: '13px',
                      backgroundColor: '#fafbfc',
                      boxSizing: 'border-box',
                      color: theme.colors.textPrimary
                    }}
                  />
                </div>
              ))}
            </div>

            <PrimaryButton
              onClick={handlePredict}
              loading={loading}
              color={theme.colors.primary}
            >
              🔍 {t.predict}
            </PrimaryButton>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: '12px', overflowY: 'auto',
          paddingRight: '4px'
        }}>

          {/* Tabs */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: theme.radius.lg,
            padding: '6px',
            boxShadow: theme.shadows.sm,
            border: `1px solid ${theme.colors.border}`,
            display: 'flex', gap: '4px'
          }}>
            {[
              { id: 'predict',  icon: '🔍', label: 'Prediction' },
              { id: 'history',  icon: '📈', label: 'History' },
              { id: 'recommend',icon: '🌱', label: 'Crops' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '10px',
                  backgroundColor: activeTab === tab.id
                    ? theme.colors.primary : 'transparent',
                  color: activeTab === tab.id
                    ? 'white' : theme.colors.textSecondary,
                  border: 'none', borderRadius: '10px',
                  cursor: 'pointer', fontWeight: '600',
                  fontSize: '13px', transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '6px'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB: Prediction Result */}
          {activeTab === 'predict' && (
            <div style={{ flex: 1 }}>
              {!result ? (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: theme.radius.lg,
                  padding: '40px', textAlign: 'center',
                  boxShadow: theme.shadows.md,
                  border: `1px solid ${theme.colors.border}`,
                  height: '100%',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{
                    fontSize: '56px', marginBottom: '16px'
                  }}>
                    🌾
                  </div>
                  <h3 style={{
                    color: theme.colors.textPrimary,
                    marginBottom: '8px'
                  }}>
                    Ready to Predict
                  </h3>
                  <p style={{
                    color: theme.colors.textMuted,
                    fontSize: '14px'
                  }}>
                    Fill in crop parameters and click
                    Predict to see your risk score
                  </p>
                </div>
              ) : (() => {
                const colors = getRiskColors(result.color);
                return (
                  <div style={{
                    animation: 'fadeIn 0.4s ease'
                  }}>
                    {/* Main Score Card */}
                    <div style={{
                      backgroundColor: colors.bg,
                      border: `2px solid ${colors.border}`,
                      borderRadius: theme.radius.lg,
                      padding: '24px',
                      boxShadow: theme.shadows.md,
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      <p style={{
                        fontSize: '13px', fontWeight: '600',
                        color: colors.text,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '8px'
                      }}>
                        {t.result}
                      </p>
                      <div style={{
                        fontSize: '72px', fontWeight: '800',
                        color: colors.text, lineHeight: 1,
                        marginBottom: '8px'
                      }}>
                        {result.risk_score}%
                      </div>
                      <div style={{
                        display: 'inline-block',
                        backgroundColor: colors.border,
                        color: 'white', padding: '4px 16px',
                        borderRadius: '20px', fontSize: '14px',
                        fontWeight: '700'
                      }}>
                        {getRiskLabel(result.status)}
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: theme.colors.textMuted,
                        marginTop: '8px'
                      }}>
                        Farmer: {result.farmer}
                      </p>
                    </div>

                    {/* Info Cards Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '10px', marginBottom: '12px'
                    }}>
                      {/* Risk Factors */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: theme.radius.md,
                        padding: '14px',
                        boxShadow: theme.shadows.sm,
                        border: `1px solid ${theme.colors.border}`
                      }}>
                        <p style={{
                          fontSize: '11px', fontWeight: '700',
                          color: theme.colors.textMuted,
                          marginBottom: '8px',
                          textTransform: 'uppercase'
                        }}>
                          ⚠️ Risk Factors
                        </p>
                        {result.contributing_factors?.map(
                          (f, i) => (
                          <p key={i} style={{
                            fontSize: '12px',
                            color: colors.text,
                            marginBottom: '4px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '4px'
                          }}>
                            • {f}
                          </p>
                        ))}
                      </div>

                      {/* Advice */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: theme.radius.md,
                        padding: '14px',
                        boxShadow: theme.shadows.sm,
                        border: `1px solid ${theme.colors.border}`
                      }}>
                        <p style={{
                          fontSize: '11px', fontWeight: '700',
                          color: theme.colors.textMuted,
                          marginBottom: '8px',
                          textTransform: 'uppercase'
                        }}>
                          📋 Advice
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: theme.colors.textPrimary,
                          lineHeight: 1.5
                        }}>
                          {result.advice}
                        </p>
                      </div>

                      {/* Insurance */}
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: theme.radius.md,
                        padding: '14px',
                        boxShadow: theme.shadows.sm,
                        border: `1px solid ${theme.colors.border}`
                      }}>
                        <p style={{
                          fontSize: '11px', fontWeight: '700',
                          color: theme.colors.textMuted,
                          marginBottom: '8px',
                          textTransform: 'uppercase'
                        }}>
                          🛡️ Insurance
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: colors.text,
                          fontWeight: '600',
                          lineHeight: 1.5
                        }}>
                          {result.insurance_status}
                        </p>
                      </div>
                    </div>

                    {/* Insurance Claim Button */}
                    {result.color === 'red' && (
                      <button
                        onClick={() => navigate('/insurance')}
                        style={{
                          width: '100%', padding: '14px',
                          background: `linear-gradient(135deg,
                            #dc2626 0%, #b91c1c 100%)`,
                          color: 'white', border: 'none',
                          borderRadius: theme.radius.md,
                          fontSize: '15px', fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '8px',
                          animation: 'pulse 2s infinite'
                        }}
                      >
                        📋 Generate Insurance Claim →
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: History */}
          {activeTab === 'history' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: theme.radius.lg,
              padding: '20px',
              boxShadow: theme.shadows.md,
              border: `1px solid ${theme.colors.border}`,
              flex: 1
            }}>
              <h3 style={{
                color: theme.colors.textPrimary,
                marginBottom: '16px', fontSize: '15px',
                fontWeight: '700'
              }}>
                📈 Risk Score History
              </h3>

              {history.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '40px',
                  color: theme.colors.textMuted
                }}>
                  <div style={{ fontSize: '40px' }}>📊</div>
                  <p style={{ marginTop: '12px' }}>
                    No predictions yet
                  </p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={history}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10,
                          fill: theme.colors.textMuted }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 10,
                          fill: theme.colors.textMuted }}
                        tickFormatter={v => `${v}%`}
                      />
                      <Tooltip
                        formatter={v =>
                          [`${v}%`, 'Risk Score']}
                        contentStyle={{
                          borderRadius: '10px',
                          border: `1px solid ${theme.colors.border}`,
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="risk_score"
                        stroke={theme.colors.primary}
                        strokeWidth={3}
                        dot={{ fill: theme.colors.secondary,
                          r: 5, strokeWidth: 2 }}
                        activeDot={{ r: 7,
                          fill: theme.colors.accent }}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div style={{ marginTop: '12px' }}>
                    {history.slice().reverse().map((h, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        backgroundColor: i % 2 === 0
                          ? '#f8fafc' : 'white',
                        borderRadius: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          color: theme.colors.textMuted
                        }}>
                          {h.date} {h.time}
                        </span>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center', gap: '8px'
                        }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: h.risk_score > 60
                              ? '#dc2626'
                              : h.risk_score > 30
                              ? '#d97706' : '#16a34a'
                          }}>
                            {h.risk_score}%
                          </span>
                          <Badge
                            text={h.risk_status}
                            type={h.risk_score > 60
                              ? 'danger'
                              : h.risk_score > 30
                              ? 'warning' : 'success'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: Crop Recommendation */}
          {activeTab === 'recommend' && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: theme.radius.lg,
              padding: '20px',
              boxShadow: theme.shadows.md,
              border: `1px solid ${theme.colors.border}`,
              flex: 1
            }}>
              <h3 style={{
                color: theme.colors.textPrimary,
                marginBottom: '16px', fontSize: '15px',
                fontWeight: '700'
              }}>
                🌱 Crop Recommendations
              </h3>

              {recommendations.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '40px',
                  color: theme.colors.textMuted
                }}>
                  <div style={{ fontSize: '40px' }}>🌾</div>
                  <p style={{ marginTop: '12px' }}>
                    Make a prediction first to get
                    crop recommendations
                  </p>
                </div>
              ) : (
                <>
                  {recommendations.map((rec, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '14px',
                      padding: '14px',
                      backgroundColor: i === 0
                        ? '#f0fdf4' : '#f8fafc',
                      border: `1.5px solid ${i === 0
                        ? '#86efac' : theme.colors.border}`,
                      borderRadius: theme.radius.md,
                      marginBottom: '10px',
                      transition: 'all 0.2s ease'
                    }}>
                      <div style={{
                        fontSize: '32px', flexShrink: 0
                      }}>
                        {rec.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '4px'
                        }}>
                          <span style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            color: theme.colors.textPrimary
                          }}>
                            {i === 0 && '⭐ '}{rec.crop}
                          </span>
                          <Badge
                            text={`${rec.confidence} Match`}
                            type={rec.confidence === 'High'
                              ? 'success'
                              : rec.confidence === 'Medium'
                              ? 'warning' : 'danger'}
                          />
                        </div>
                        <p style={{
                          fontSize: '12px',
                          color: theme.colors.textMuted,
                          margin: 0, lineHeight: 1.4
                        }}>
                          {rec.reason}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div style={{
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px', padding: '10px 14px',
                    fontSize: '12px', color: '#92400e'
                  }}>
                    💡 Consult your local KVK for
                    professional guidance
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;