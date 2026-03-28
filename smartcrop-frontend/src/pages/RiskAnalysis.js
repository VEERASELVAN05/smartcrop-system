import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  ReferenceLine, Area, AreaChart
} from 'recharts';
import {
  calculateNDVI, getNDVIStatus,
  predictRainfallTrend, calculateCumulativeRisk
} from '../riskEngine';
import { theme } from '../theme';
import { Navbar, NavButton, StatCard } from '../components/UI';

function RiskAnalysis() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [cumulativeData, setCumulativeData] = useState(null);
  const [ndvi, setNdvi] = useState(null);
  const [ndviStatus, setNdviStatus] = useState(null);
  const [lstmData, setLstmData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  const districtCoords = {
    'Coimbatore':      { lat: 11.0168, lon: 76.9558 },
    'Chennai':         { lat: 13.0827, lon: 80.2707 },
    'Madurai':         { lat: 9.9252,  lon: 78.1198 },
    'Thanjavur':       { lat: 10.7870, lon: 79.1378 },
    'Salem':           { lat: 11.6643, lon: 78.1460 },
    'Tirunelveli':     { lat: 8.7139,  lon: 77.7567 },
    'Tiruchirappalli': { lat: 10.7905, lon: 78.7047 },
    'Erode':           { lat: 11.3410, lon: 77.7172 },
    'Tiruppur':        { lat: 11.1085, lon: 77.3411 },
    'Vellore':         { lat: 12.9165, lon: 79.1325 },
    'Dindigul':        { lat: 10.3673, lon: 77.9803 },
    'Kanchipuram':     { lat: 12.8185, lon: 79.6947 },
    'Dharmapuri':      { lat: 12.1211, lon: 78.1582 },
    'Krishnagiri':     { lat: 12.5266, lon: 78.2134 },
    'Namakkal':        { lat: 11.2189, lon: 78.1674 },
    'Karur':           { lat: 10.9601, lon: 78.0766 },
    'Perambalur':      { lat: 11.2342, lon: 78.8821 },
    'Ariyalur':        { lat: 11.1404, lon: 79.0762 },
    'Cuddalore':       { lat: 11.7480, lon: 79.7714 },
    'Villupuram':      { lat: 11.9401, lon: 79.4861 },
    'Kallakurichi':    { lat: 11.7384, lon: 78.9583 },
    'Tiruvannamalai':  { lat: 12.2253, lon: 79.0747 },
    'Ranipet':         { lat: 12.9225, lon: 79.3325 },
    'Tirupathur':      { lat: 12.4961, lon: 78.5641 },
    'Tiruvallur':      { lat: 13.1437, lon: 79.9088 },
    'Chengalpattu':    { lat: 12.6921, lon: 79.9756 },
    'Kancheepuram':    { lat: 12.8185, lon: 79.6947 },
    'Nagapattinam':    { lat: 10.7672, lon: 79.8449 },
    'Mayiladuthurai':  { lat: 11.1015, lon: 79.6519 },
    'Tiruvarur':       { lat: 10.7726, lon: 79.6367 },
    'Pudukkottai':     { lat: 10.3797, lon: 78.8199 },
    'Sivaganga':       { lat: 9.8478,  lon: 78.4800 },
    'Ramanathapuram':  { lat: 9.3762,  lon: 78.8302 },
    'Virudhunagar':    { lat: 9.5851,  lon: 77.9620 },
    'Thoothukudi':     { lat: 8.7642,  lon: 78.1348 },
    'Tenkasi':         { lat: 8.9593,  lon: 77.3152 },
    'Theni':           { lat: 10.0104, lon: 77.4773 },
    'Nilgiris':        { lat: 11.4916, lon: 76.7337 },
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load profile
      const profRes = await axios.get(
        'http://127.0.0.1:8000/profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (profRes.data.has_profile) {
        const p = profRes.data.profile;
        setProfile(p);

        // Load weather
        const coords = districtCoords[p.district] ||
                       { lat: 11.0168, lon: 76.9558 };
        const weatherRes = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&timezone=Asia/Kolkata`
        );
        const curr = weatherRes.data.current;
        const weatherData = {
          temperature: curr.temperature_2m,
          humidity: curr.relative_humidity_2m,
          rainfall: curr.precipitation,
          windSpeed: curr.wind_speed_10m,
        };
        setWeather(weatherData);

        // Calculate NDVI
        const currentMonth = new Date().getMonth() + 1;
        const dayOfSeason = (
          (currentMonth - (p.start_month || 6) + 12) % 12
        ) * 30;
        const ndviVal = calculateNDVI(
          weatherData.rainfall,
          weatherData.temperature,
          weatherData.humidity,
          dayOfSeason
        );
        setNdvi(ndviVal);
        setNdviStatus(getNDVIStatus(ndviVal));

        // LSTM prediction
        const lstm = predictRainfallTrend(
          weatherData.rainfall,
          weatherData.temperature,
          weatherData.humidity,
          p.district,
          currentMonth
        );
        setLstmData(lstm);

        // Load cumulative risk history
        const histRes = await axios.get(
          'http://127.0.0.1:8000/risk-history',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHistory(histRes.data.history || []);
        setCumulativeData(histRes.data);
      }
    } catch (err) {
      console.log('Error:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>🧠</div>
          <div style={{
            width: '40px', height: '40px',
            border: `3px solid ${theme.colors.border}`,
            borderTop: `3px solid ${theme.colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '16px auto'
          }} />
          <p style={{ color: theme.colors.textMuted }}>
            Running AI analysis...
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
      <Navbar
        icon="🧠"
        title="Advanced Risk Analysis"
        subtitle="LSTM • NDVI • Cumulative Risk Engine"
        buttons={
          <NavButton onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </NavButton>
        }
      />

      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '20px 16px'
      }}>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px', marginBottom: '20px'
        }}>
          <StatCard
            icon="📡"
            label="NDVI Index"
            value={ndvi?.toFixed(2) || 'N/A'}
            color={ndviStatus?.color || '#6b7280'}
            trend={ndviStatus?.status}
          />
          <StatCard
            icon="🌧️"
            label="7-Day Rain Forecast"
            value={`${lstmData?.totalPredicted || 0}mm`}
            color={
              lstmData?.riskForecast === 'LOW RISK'
                ? '#16a34a'
                : lstmData?.riskForecast === 'MODERATE RISK'
                ? '#d97706' : '#dc2626'
            }
            trend={lstmData?.trend}
          />
          <StatCard
            icon="📊"
            label="Cumulative Risk"
            value={`${cumulativeData?.cumulative_risk || 0}%`}
            color={
              (cumulativeData?.cumulative_risk || 0) < 40
                ? '#16a34a'
                : (cumulativeData?.cumulative_risk || 0) < 60
                ? '#d97706' : '#dc2626'
            }
            trend={`${cumulativeData?.consecutive_high_risk || 0} consecutive days`}
          />
          <StatCard
            icon="🛡️"
            label="Insurance Status"
            value={
              cumulativeData?.insurance_eligible
                ? 'ELIGIBLE' : 'MONITORING'
            }
            color={
              cumulativeData?.insurance_eligible
                ? '#dc2626' : '#16a34a'
            }
            trend={
              cumulativeData?.insurance_eligible
                ? 'Claim can be filed!'
                : `${cumulativeData?.days_until_trigger || 3} days to trigger`
            }
          />
        </div>

        {/* Cumulative Risk Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px', padding: '20px',
          boxShadow: theme.shadows.md,
          border: `1px solid ${theme.colors.border}`,
          marginBottom: '16px'
        }}>
          <h3 style={{
            color: theme.colors.textPrimary,
            marginBottom: '8px', fontSize: '15px',
            fontWeight: '700'
          }}>
            📊 Cumulative Risk Analysis
            <span style={{
              fontSize: '11px', fontWeight: '400',
              color: theme.colors.textMuted,
              marginLeft: '8px'
            }}>
              Insurance triggers after 3 consecutive
              high-risk days
            </span>
          </h3>

          {/* Progress indicator */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '12px', padding: '16px',
            marginBottom: '16px',
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{
                fontSize: '13px', fontWeight: '600',
                color: theme.colors.textSecondary
              }}>
                Consecutive High Risk Days
              </span>
              <span style={{
                fontSize: '13px', fontWeight: '700',
                color: (cumulativeData?.consecutive_high_risk || 0) >= 3
                  ? '#dc2626' : '#d97706'
              }}>
                {cumulativeData?.consecutive_high_risk || 0} / 3
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              height: '10px',
              backgroundColor: '#e2e8f0',
              borderRadius: '5px', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100,
                  ((cumulativeData?.consecutive_high_risk || 0) / 3) * 100
                )}%`,
                backgroundColor:
                  (cumulativeData?.consecutive_high_risk || 0) >= 3
                    ? '#dc2626' : '#d97706',
                borderRadius: '5px',
                transition: 'width 0.5s ease'
              }} />
            </div>

            <p style={{
              fontSize: '13px',
              color: theme.colors.textMuted,
              marginTop: '10px', margin: '10px 0 0'
            }}>
              💬 {cumulativeData?.message}
            </p>
          </div>

          {/* Risk history chart */}
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={history.slice().reverse()}>
                <defs>
                  <linearGradient
                    id="riskGrad" x1="0" y1="0"
                    x2="0" y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={theme.colors.primary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={theme.colors.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickFormatter={v =>
                    v ? v.slice(5, 10) : ''
                  }
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10 }}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip
                  formatter={v =>
                    [`${v}%`, 'Risk Score']
                  }
                />
                <ReferenceLine
                  y={60} stroke="#dc2626"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Insurance Threshold (60%)',
                    fill: '#dc2626', fontSize: 10
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="risk_score"
                  stroke={theme.colors.primary}
                  strokeWidth={2.5}
                  fill="url(#riskGrad)"
                  dot={{ r: 4,
                    fill: theme.colors.primary }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              textAlign: 'center', padding: '30px',
              color: theme.colors.textMuted
            }}>
              <p>Make predictions to see cumulative risk trend</p>
            </div>
          )}
        </div>

        {/* Two column: LSTM + NDVI */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px', marginBottom: '16px'
        }}>

          {/* LSTM Rainfall Forecast */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px', padding: '20px',
            boxShadow: theme.shadows.md,
            border: `1px solid ${theme.colors.border}`
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', marginBottom: '12px'
            }}>
              <div>
                <h3 style={{
                  color: theme.colors.textPrimary,
                  fontSize: '15px', fontWeight: '700',
                  margin: 0
                }}>
                  🧠 LSTM Rainfall Forecast
                </h3>
                <p style={{
                  fontSize: '11px',
                  color: theme.colors.textMuted,
                  margin: '3px 0 0'
                }}>
                  Next 7 days prediction
                </p>
              </div>
              <div style={{
                backgroundColor:
                  lstmData?.riskForecast === 'LOW RISK'
                    ? '#f0fdf4'
                    : lstmData?.riskForecast === 'MODERATE RISK'
                    ? '#fffbeb' : '#fef2f2',
                border: `1px solid ${
                  lstmData?.riskForecast === 'LOW RISK'
                    ? '#86efac'
                    : lstmData?.riskForecast === 'MODERATE RISK'
                    ? '#fde68a' : '#fecaca'
                }`,
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '11px', fontWeight: '700',
                color:
                  lstmData?.riskForecast === 'LOW RISK'
                    ? '#15803d'
                    : lstmData?.riskForecast === 'MODERATE RISK'
                    ? '#b45309' : '#b91c1c'
              }}>
                {lstmData?.riskForecast}
              </div>
            </div>

            {lstmData && (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={lstmData.predictions}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v, n) => [
                        n === 'rainfall'
                          ? `${v}mm` : `${v}%`,
                        n === 'rainfall'
                          ? 'Rainfall' : 'Confidence'
                      ]}
                    />
                    <Bar
                      dataKey="rainfall"
                      fill={theme.colors.primary}
                      radius={[4, 4, 0, 0]}
                      name="rainfall"
                    />
                  </BarChart>
                </ResponsiveContainer>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '8px', marginTop: '12px'
                }}>
                  {[
                    { label: 'Total',
                      val: `${lstmData.totalPredicted}mm` },
                    { label: 'Daily Avg',
                      val: `${lstmData.avgDaily}mm` },
                    { label: 'Trend',
                      val: lstmData.trend },
                  ].map((s, i) => (
                    <div key={i} style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '8px', textAlign: 'center'
                    }}>
                      <p style={{
                        fontSize: '13px', fontWeight: '700',
                        color: theme.colors.textPrimary,
                        margin: 0
                      }}>
                        {s.val}
                      </p>
                      <p style={{
                        fontSize: '10px',
                        color: theme.colors.textMuted,
                        margin: '2px 0 0'
                      }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* NDVI Section */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px', padding: '20px',
            boxShadow: theme.shadows.md,
            border: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{
              color: theme.colors.textPrimary,
              fontSize: '15px', fontWeight: '700',
              marginBottom: '12px'
            }}>
              🛰️ NDVI Vegetation Index
            </h3>

            {ndvi !== null && ndviStatus && (
              <>
                {/* NDVI Gauge */}
                <div style={{
                  backgroundColor: ndviStatus.bg,
                  border: `2px solid ${ndviStatus.color}20`,
                  borderRadius: '12px', padding: '20px',
                  textAlign: 'center', marginBottom: '16px'
                }}>
                  <p style={{
                    fontSize: '48px', fontWeight: '800',
                    color: ndviStatus.color, margin: 0
                  }}>
                    {ndvi.toFixed(3)}
                  </p>
                  <p style={{
                    fontSize: '14px', fontWeight: '700',
                    color: ndviStatus.color,
                    margin: '4px 0'
                  }}>
                    {ndviStatus.status}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: theme.colors.textMuted,
                    margin: 0
                  }}>
                    {ndviStatus.desc}
                  </p>
                </div>

                {/* NDVI Scale */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      color: theme.colors.textMuted
                    }}>
                      -0.5 (No Vegetation)
                    </span>
                    <span style={{
                      fontSize: '10px',
                      color: theme.colors.textMuted
                    }}>
                      0.9 (Dense Vegetation)
                    </span>
                  </div>
                  <div style={{
                    height: '10px', borderRadius: '5px',
                    background: 'linear-gradient(to right, #dc2626, #d97706, #16a34a)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: `${((ndvi + 0.5) / 1.4) * 100}%`,
                      top: '-4px',
                      width: '18px', height: '18px',
                      backgroundColor: 'white',
                      border: `3px solid ${ndviStatus.color}`,
                      borderRadius: '50%',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>

                {/* NDVI Details */}
                {[
                  { label: 'What this means',
                    val: ndviStatus.desc },
                  { label: 'Healthy range',
                    val: '0.4 to 0.8' },
                  { label: 'Current value',
                    val: ndvi.toFixed(3) },
                  { label: 'Crop stress risk',
                    val: ndvi < 0.2 ? 'High'
                      : ndvi < 0.4 ? 'Moderate' : 'Low' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: i < 3
                      ? `1px solid ${theme.colors.border}`
                      : 'none'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: theme.colors.textMuted
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: '12px', fontWeight: '600',
                      color: theme.colors.textPrimary
                    }}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Insurance Trigger Explanation */}
        <div style={{
          backgroundColor:
            cumulativeData?.insurance_eligible
              ? '#fef2f2' : '#f0fdf4',
          border: `2px solid ${
            cumulativeData?.insurance_eligible
              ? '#fecaca' : '#86efac'
          }`,
          borderRadius: '16px', padding: '20px'
        }}>
          <h3 style={{
            color: cumulativeData?.insurance_eligible
              ? '#b91c1c' : '#15803d',
            marginBottom: '12px', fontSize: '15px',
            fontWeight: '700'
          }}>
            {cumulativeData?.insurance_eligible
              ? '🚨 Insurance Claim Eligible!'
              : '✅ Monitoring Active'}
          </h3>
          <p style={{
            fontSize: '14px',
            color: theme.colors.textPrimary,
            marginBottom: '16px', lineHeight: 1.6
          }}>
            {cumulativeData?.insurance_eligible
              ? 'Your crop has experienced high risk conditions for 3 or more consecutive days. This meets the PMFBY insurance trigger criteria. You can now file a claim.'
              : 'SmartCrop monitors your crop daily. Insurance is triggered only after 3 consecutive high-risk days — ensuring fair and realistic claims based on sustained weather stress, not single-day variations.'}
          </p>
          <div style={{
            display: 'flex', gap: '12px'
          }}>
            {cumulativeData?.insurance_eligible && (
              <button
                onClick={() => navigate('/insurance')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#dc2626',
                  color: 'white', border: 'none',
                  borderRadius: '10px', fontSize: '14px',
                  fontWeight: '700', cursor: 'pointer'
                }}
              >
                📋 File Insurance Claim →
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px 24px',
                backgroundColor: theme.colors.primary,
                color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '14px',
                fontWeight: '700', cursor: 'pointer'
              }}
            >
              🌾 Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskAnalysis;