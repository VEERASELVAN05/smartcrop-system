import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import translations from '../translations';

function Insurance() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('language') || 'English';
  const t = translations[lang] || translations['English'];

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load history
      const histRes = await axios.get(
        'http://127.0.0.1:8000/history',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(histRes.data.history || []);

      // Load profile
      const profRes = await axios.get(
        'http://127.0.0.1:8000/profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (profRes.data.has_profile) {
        setProfile(profRes.data.profile);
      }
    } catch { }
  };

  const handleClaim = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/claim', {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClaim(res.data.claim);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Failed to generate claim. Make sure you have a prediction first.'
      );
    }
    setLoading(false);
  };

  const latest = history[0];
  const eligible = latest && latest.risk_score >= 60;

  const compensation = profile && latest
    ? Math.round(
        10000 * (profile.land_size || 1) *
        (latest.risk_score / 100)
      )
    : 0;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F7FA',
      fontFamily: 'Arial'
    }}>

      {/* Navbar */}
      <div style={{
        backgroundColor: '#1B2A4A', padding: '12px 25px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <div>
            <div style={{
              color: 'white', fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Insurance Portal
            </div>
            <div style={{ color: '#9EC8B9', fontSize: '11px' }}>
              PMFBY — Pradhan Mantri Fasal Bima Yojana
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
          ← Dashboard
        </button>
      </div>

      <div style={{
        maxWidth: '750px', margin: '25px auto', padding: '0 15px'
      }}>

        {/* Farmer Info */}
        <div style={{
          backgroundColor: '#1B2A4A', borderRadius: '12px',
          padding: '20px', marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              color: 'white', fontWeight: 'bold', fontSize: '16px'
            }}>
              👨‍🌾 {user.name}
            </div>
            <div style={{ color: '#9EC8B9', fontSize: '13px' }}>
              📍 {user.district}
              {profile && ` | 🌾 ${profile.crop_type} | 📐 ${profile.land_size} acres`}
            </div>
          </div>
          <div style={{
            backgroundColor: eligible ? '#DC2626' : '#059669',
            padding: '8px 16px', borderRadius: '20px',
            color: 'white', fontWeight: 'bold', fontSize: '13px'
          }}>
            {eligible ? '⚠️ ELIGIBLE' : '✅ NOT ELIGIBLE'}
          </div>
        </div>

        {/* Status Card */}
        <div style={{
          backgroundColor: eligible ? '#FEE2E2' : '#D1FAE5',
          border: `2px solid ${eligible ? '#DC2626' : '#059669'}`,
          borderRadius: '12px', padding: '25px',
          marginBottom: '20px', textAlign: 'center'
        }}>
          <div style={{ fontSize: '56px' }}>
            {eligible ? '⚠️' : '✅'}
          </div>
          <h2 style={{
            color: eligible ? '#DC2626' : '#065F46',
            margin: '10px 0'
          }}>
            {eligible
              ? 'Insurance Claim Eligible!'
              : 'Your Crop is Safe'}
          </h2>

          {latest ? (
            <div>
              <p style={{ color: '#374151', margin: '5px 0' }}>
                Latest Risk Score:{' '}
                <strong style={{
                  color: eligible ? '#DC2626' : '#059669',
                  fontSize: '20px'
                }}>
                  {latest.risk_score}%
                </strong>
              </p>
              <p style={{
                color: '#6B7280', fontSize: '13px', margin: 0
              }}>
                Status: {latest.risk_status}
              </p>
              {eligible && (
                <p style={{
                  color: '#DC2626', fontWeight: 'bold',
                  fontSize: '18px', margin: '10px 0 0'
                }}>
                  Estimated Compensation: ₹{compensation.toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: '#6B7280' }}>
              No predictions yet. Go to dashboard
              and run a prediction first.
            </p>
          )}
        </div>

        {/* Claim Generation */}
        {eligible && !claim && (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '25px', marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>
              📋 Generate Insurance Claim
            </h3>

            {/* Claim Details */}
            {profile && (
              <div style={{
                backgroundColor: '#F9FAFB',
                borderRadius: '8px', padding: '15px',
                marginBottom: '15px'
              }}>
                {[
                  { label: 'Farmer', val: user.name },
                  { label: 'Crop', val: profile.crop_type },
                  { label: 'Land Size', val: `${profile.land_size} acres` },
                  { label: 'District', val: profile.district },
                  { label: 'Risk Score', val: `${latest?.risk_score}%` },
                  { label: 'Est. Compensation', val: `₹${compensation.toLocaleString()}` },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: i < 5
                      ? '1px solid #E5E7EB' : 'none'
                  }}>
                    <span style={{
                      color: '#6B7280', fontSize: '13px'
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      color: '#1B2A4A', fontWeight: 'bold',
                      fontSize: '13px'
                    }}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: '8px', padding: '10px',
                marginBottom: '15px', color: '#DC2626',
                fontSize: '13px'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleClaim}
              style={{
                width: '100%', padding: '14px',
                backgroundColor: '#DC2626',
                color: 'white', border: 'none',
                borderRadius: '8px', fontSize: '15px',
                fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {loading
                ? '⏳ Generating claim...'
                : '📋 Generate Claim Now'}
            </button>
          </div>
        )}

        {/* Claim Success */}
        {claim && (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '25px', marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            border: '2px solid #2C7A3F'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px' }}>✅</div>
              <h3 style={{ color: '#2C7A3F', margin: '10px 0' }}>
                Claim Generated Successfully!
              </h3>
              <p style={{
                color: '#6B7280', fontSize: '13px', margin: 0
              }}>
                Claim ID: <strong>#{claim.claim_id}</strong>
              </p>
            </div>

            {[
              { label: 'Farmer Name',   val: claim.farmer },
              { label: 'Crop Type',     val: claim.crop },
              { label: 'Land Size',     val: `${claim.land_size} acres` },
              { label: 'Risk Score',    val: `${claim.risk_score}%` },
              { label: 'Compensation',  val: claim.compensation },
              { label: 'Claim Status',  val: claim.status },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < 5
                  ? '1px solid #F3F4F6' : 'none'
              }}>
                <span style={{
                  color: '#6B7280', fontSize: '14px'
                }}>
                  {item.label}
                </span>
                <span style={{
                  color: '#1B2A4A', fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {item.val}
                </span>
              </div>
            ))}

            <div style={{
              backgroundColor: '#ECFDF5',
              borderRadius: '8px', padding: '12px',
              marginTop: '15px', textAlign: 'center'
            }}>
              <p style={{
                margin: 0, color: '#065F46', fontSize: '13px'
              }}>
                📱 Claim submitted to insurance department.
                You will receive SMS updates on your phone.
              </p>
            </div>
          </div>
        )}

        {/* Risk History */}
        {history.length > 0 && (
          <div style={{
            backgroundColor: 'white', borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>
              📊 Risk History
            </h3>
            {history.map((h, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: i % 2 === 0
                  ? '#F9FAFB' : 'white',
                borderRadius: '6px', marginBottom: '4px'
              }}>
                <span style={{
                  fontSize: '12px', color: '#6B7280'
                }}>
                  {new Date(h.date).toLocaleDateString('en-IN')}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center', gap: '10px'
                }}>
                  <div style={{
                    width: '80px', height: '6px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '3px'
                  }}>
                    <div style={{
                      width: `${h.risk_score}%`,
                      height: '100%',
                      backgroundColor:
                        h.risk_score > 60 ? '#DC2626' :
                        h.risk_score > 30 ? '#D97706' :
                        '#059669',
                      borderRadius: '3px'
                    }} />
                  </div>
                  <span style={{
                    fontSize: '13px', fontWeight: 'bold',
                    color:
                      h.risk_score > 60 ? '#DC2626' :
                      h.risk_score > 30 ? '#D97706' :
                      '#059669',
                    minWidth: '45px'
                  }}>
                    {h.risk_score}%
                  </span>
                  <span style={{
                    fontSize: '11px',
                    backgroundColor:
                      h.risk_score > 60 ? '#FEE2E2' :
                      h.risk_score > 30 ? '#FEF3C7' :
                      '#D1FAE5',
                    color:
                      h.risk_score > 60 ? '#DC2626' :
                      h.risk_score > 30 ? '#D97706' :
                      '#059669',
                    padding: '2px 8px',
                    borderRadius: '10px', fontWeight: 'bold'
                  }}>
                    {h.risk_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Insurance;