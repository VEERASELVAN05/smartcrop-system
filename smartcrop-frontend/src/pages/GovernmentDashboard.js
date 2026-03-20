import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

// Tamil Nadu districts with simulated risk data
const districtData = [
  { district: "Coimbatore",   risk: 72, farmers: 1245, claims: 89,  rainfall: 12,  temp: 38 },
  { district: "Madurai",      risk: 65, farmers: 980,  claims: 67,  rainfall: 18,  temp: 37 },
  { district: "Thanjavur",    risk: 28, farmers: 2100, claims: 12,  rainfall: 145, temp: 29 },
  { district: "Salem",        risk: 58, farmers: 876,  claims: 54,  rainfall: 25,  temp: 36 },
  { district: "Tirunelveli",  risk: 45, farmers: 654,  claims: 32,  rainfall: 55,  temp: 34 },
  { district: "Trichy",       risk: 35, farmers: 1100, claims: 18,  rainfall: 89,  temp: 31 },
  { district: "Erode",        risk: 62, farmers: 743,  claims: 48,  rainfall: 22,  temp: 37 },
  { district: "Tiruppur",     risk: 55, farmers: 654,  claims: 38,  rainfall: 30,  temp: 35 },
  { district: "Vellore",      risk: 42, farmers: 543,  claims: 24,  rainfall: 62,  temp: 33 },
  { district: "Dindigul",     risk: 68, farmers: 432,  claims: 56,  rainfall: 15,  temp: 38 },
  { district: "Kanchipuram",  risk: 32, farmers: 765,  claims: 15,  rainfall: 98,  temp: 30 },
  { district: "Chennai",      risk: 22, farmers: 234,  claims: 8,   rainfall: 125, temp: 28 },
];

const getRiskColor = (risk) => {
  if (risk >= 60) return '#DC2626';
  if (risk >= 40) return '#D97706';
  return '#059669';
};

const getRiskLabel = (risk) => {
  if (risk >= 60) return 'HIGH';
  if (risk >= 40) return 'MODERATE';
  return 'SAFE';
};

function GovernmentDashboard() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = districtData.filter(d => {
    if (filter === 'high') return d.risk >= 60;
    if (filter === 'moderate') return d.risk >= 40 && d.risk < 60;
    if (filter === 'safe') return d.risk < 40;
    return true;
  });

  const totalFarmers = districtData.reduce(
    (sum, d) => sum + d.farmers, 0);
  const totalClaims = districtData.reduce(
    (sum, d) => sum + d.claims, 0);
  const highRisk = districtData.filter(
    d => d.risk >= 60).length;
  const avgRisk = Math.round(
    districtData.reduce((sum, d) => sum + d.risk, 0) /
    districtData.length);

  const pieData = [
    { name: 'High Risk',   value: districtData.filter(d => d.risk >= 60).length,  color: '#DC2626' },
    { name: 'Moderate',    value: districtData.filter(d => d.risk >= 40 && d.risk < 60).length, color: '#D97706' },
    { name: 'Safe',        value: districtData.filter(d => d.risk < 40).length,   color: '#059669' },
  ];

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
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>🏛️</span>
          <div>
            <div style={{
              color: 'white', fontWeight: 'bold', fontSize: '16px'
            }}>
              Government Dashboard
            </div>
            <div style={{ color: '#9EC8B9', fontSize: '11px' }}>
              Tamil Nadu Crop Risk Monitoring System
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #9EC8B9',
            color: '#9EC8B9', padding: '6px 14px',
            borderRadius: '6px', cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ← Farmer Dashboard
        </button>
      </div>

      <div style={{
        maxWidth: '1100px', margin: '20px auto', padding: '0 15px'
      }}>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px', marginBottom: '20px'
        }}>
          {[
            { icon: '👨‍🌾', label: 'Total Farmers',    val: totalFarmers.toLocaleString(), color: '#1B2A4A' },
            { icon: '⚠️',   label: 'High Risk Districts', val: `${highRisk}/12`,           color: '#DC2626' },
            { icon: '📋',   label: 'Pending Claims',   val: totalClaims,                   color: '#D97706' },
            { icon: '📊',   label: 'Avg Risk Score',   val: `${avgRisk}%`,                 color: '#2C7A3F' },
          ].map((stat, i) => (
            <div key={i} style={{
              backgroundColor: 'white',
              borderRadius: '12px', padding: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${stat.color}`
            }}>
              <div style={{ fontSize: '28px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '24px', fontWeight: 'bold',
                color: stat.color, margin: '5px 0'
              }}>
                {stat.val}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '15px', marginBottom: '20px'
        }}>

          {/* Bar Chart */}
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>
              📊 District-wise Risk Score
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={districtData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F3F4F6"
                />
                <XAxis
                  dataKey="district"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={[0, 100]}
                  tickFormatter={v => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={v => [`${v}%`, 'Risk Score']}
                />
                <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                  {districtData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={getRiskColor(d.risk)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
          }}>
            <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>
              🥧 Risk Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) =>
                    `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px', marginTop: '10px'
            }}>
              {pieData.map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center', gap: '5px'
                }}>
                  <div style={{
                    width: '10px', height: '10px',
                    borderRadius: '50%',
                    backgroundColor: p.color
                  }} />
                  <span style={{
                    fontSize: '11px', color: '#6B7280'
                  }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex', gap: '10px', marginBottom: '15px'
        }}>
          {[
            { val: 'all',      label: '🗺️ All Districts' },
            { val: 'high',     label: '🔴 High Risk' },
            { val: 'moderate', label: '🟡 Moderate' },
            { val: 'safe',     label: '🟢 Safe' },
          ].map(btn => (
            <button
              key={btn.val}
              onClick={() => setFilter(btn.val)}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === btn.val
                  ? '#1B2A4A' : '#F3F4F6',
                color: filter === btn.val
                  ? 'white' : '#374151',
                border: 'none', borderRadius: '8px',
                cursor: 'pointer', fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* District Table */}
        <div style={{
          backgroundColor: 'white', borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          overflow: 'hidden', marginBottom: '20px'
        }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#1B2A4A' }}>
                {['District', 'Risk Score', 'Status',
                  'Farmers', 'Claims', 'Rainfall',
                  'Temp', 'Action'].map(h => (
                  <th key={h} style={{
                    color: 'white', padding: '12px 15px',
                    fontSize: '12px', textAlign: 'left',
                    fontWeight: 'bold'
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr
                  key={i}
                  onClick={() => setSelected(d)}
                  style={{
                    backgroundColor: selected?.district === d.district
                      ? '#F0F9FF'
                      : i % 2 === 0 ? '#F9FAFB' : 'white',
                    cursor: 'pointer',
                    borderBottom: '1px solid #F3F4F6'
                  }}
                >
                  <td style={{
                    padding: '12px 15px', fontWeight: 'bold',
                    color: '#1B2A4A', fontSize: '13px'
                  }}>
                    📍 {d.district}
                  </td>
                  <td style={{ padding: '12px 15px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center', gap: '8px'
                    }}>
                      <div style={{
                        width: '60px', height: '8px',
                        backgroundColor: '#E5E7EB',
                        borderRadius: '4px'
                      }}>
                        <div style={{
                          width: `${d.risk}%`,
                          height: '100%',
                          backgroundColor: getRiskColor(d.risk),
                          borderRadius: '4px'
                        }} />
                      </div>
                      <span style={{
                        fontSize: '13px', fontWeight: 'bold',
                        color: getRiskColor(d.risk)
                      }}>
                        {d.risk}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 15px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '20px', fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor:
                        d.risk >= 60 ? '#FEE2E2' :
                        d.risk >= 40 ? '#FEF3C7' : '#D1FAE5',
                      color: getRiskColor(d.risk)
                    }}>
                      {getRiskLabel(d.risk)}
                    </span>
                  </td>
                  <td style={{
                    padding: '12px 15px', fontSize: '13px'
                  }}>
                    {d.farmers.toLocaleString()}
                  </td>
                  <td style={{
                    padding: '12px 15px', fontSize: '13px',
                    color: d.claims > 50 ? '#DC2626' : '#374151',
                    fontWeight: d.claims > 50 ? 'bold' : 'normal'
                  }}>
                    {d.claims}
                  </td>
                  <td style={{
                    padding: '12px 15px', fontSize: '13px'
                  }}>
                    💧 {d.rainfall}mm
                  </td>
                  <td style={{
                    padding: '12px 15px', fontSize: '13px'
                  }}>
                    🌡️ {d.temp}°C
                  </td>
                  <td style={{ padding: '12px 15px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(d);
                      }}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#1B2A4A',
                        color: 'white', border: 'none',
                        borderRadius: '6px', cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* District Detail Card */}
        {selected && (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            border: `2px solid ${getRiskColor(selected.risk)}`,
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, color: '#1B2A4A' }}>
                📍 {selected.district} — Detailed Report
              </h3>
              <button
                onClick={() => setSelected(null)}
                style={{
                  backgroundColor: '#F3F4F6',
                  border: 'none', borderRadius: '6px',
                  padding: '6px 12px', cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px'
            }}>
              {[
                { label: 'Risk Score',       val: `${selected.risk}%`,                icon: '📊', color: getRiskColor(selected.risk) },
                { label: 'Risk Status',      val: getRiskLabel(selected.risk),         icon: '⚠️', color: getRiskColor(selected.risk) },
                { label: 'Total Farmers',    val: selected.farmers.toLocaleString(),   icon: '👨‍🌾', color: '#1B2A4A' },
                { label: 'Pending Claims',   val: selected.claims,                     icon: '📋', color: '#D97706' },
                { label: 'Current Rainfall', val: `${selected.rainfall}mm`,            icon: '🌧️', color: '#2563EB' },
                { label: 'Temperature',      val: `${selected.temp}°C`,                icon: '🌡️', color: '#DC2626' },
              ].map((item, i) => (
                <div key={i} style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px', padding: '15px',
                  borderLeft: `3px solid ${item.color}`
                }}>
                  <div style={{ fontSize: '20px' }}>
                    {item.icon}
                  </div>
                  <div style={{
                    fontSize: '18px', fontWeight: 'bold',
                    color: item.color, margin: '5px 0'
                  }}>
                    {item.val}
                  </div>
                  <div style={{
                    fontSize: '11px', color: '#6B7280'
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {selected.risk >= 60 && (
              <div style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: '8px', padding: '15px',
                marginTop: '15px'
              }}>
                <p style={{
                  margin: 0, color: '#DC2626',
                  fontWeight: 'bold', fontSize: '14px'
                }}>
                  🚨 ALERT: {selected.district} requires
                  immediate government intervention!
                  {selected.claims} insurance claims pending.
                  Recommend emergency relief funds.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GovernmentDashboard;