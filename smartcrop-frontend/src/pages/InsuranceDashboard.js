import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

function InsuranceDashboard() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        'http://127.0.0.1:8000/all-claims'
      );
      setClaims(res.data.claims);
    } catch (err) {
      console.log('Error loading claims:', err);
    }
    setLoading(false);
  };

  const handleStatusChange = async (claimId, newStatus) => {
    setUpdating(true);
    try {
      await axios.put(
        `http://127.0.0.1:8000/claim/${claimId}/status?status=${newStatus}`
      );
      // Update local state
      setClaims(prev => prev.map(c =>
        c.claim_id === claimId
          ? { ...c, status: newStatus }
          : c
      ));
      if (selected?.claim_id === claimId) {
        setSelected(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status. Try again.');
    }
    setUpdating(false);
  };

  const filtered = filter === 'ALL'
    ? claims
    : claims.filter(c => c.status === filter);

  const totalClaims = claims.length;
  const pending = claims.filter(
    c => c.status === 'PENDING').length;
  const approved = claims.filter(
    c => c.status === 'APPROVED').length;
  const totalAmount = claims.reduce((sum, c) => {
    const num = parseFloat(
      c.amount.replace('₹', '').replace(',', '')
    );
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // Build monthly chart from real data
  const monthlyMap = {};
  claims.forEach(c => {
    const month = c.date?.slice(0, 7) || 'Unknown';
    if (!monthlyMap[month]) {
      monthlyMap[month] = { claims: 0, approved: 0 };
    }
    monthlyMap[month].claims++;
    if (c.status === 'APPROVED') monthlyMap[month].approved++;
  });
  const monthlyData = Object.entries(monthlyMap)
    .sort()
    .slice(-6)
    .map(([month, data]) => ({
      month: month.slice(5),
      ...data
    }));

  const getStatusStyle = (status) => {
    if (status === 'APPROVED') return {
      bg: '#D1FAE5', color: '#065F46'
    };
    if (status === 'REJECTED') return {
      bg: '#FEE2E2', color: '#DC2626'
    };
    return { bg: '#FEF3C7', color: '#92400E' };
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F5F7FA',
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
          <span style={{ fontSize: '24px' }}>🏢</span>
          <div>
            <div style={{
              color: 'white', fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Insurance Company Dashboard
            </div>
            <div style={{ color: '#9EC8B9', fontSize: '11px' }}>
              PMFBY Claims Management — Live Data
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadClaims}
            style={{
              backgroundColor: '#2C7A3F',
              border: 'none', color: 'white',
              padding: '6px 14px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '12px'
            }}
          >
            🔄 Refresh
          </button>
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
      </div>

      <div style={{
        maxWidth: '1100px', margin: '20px auto',
        padding: '0 15px'
      }}>

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: 'center', padding: '50px',
            color: '#6B7280'
          }}>
            <p style={{ fontSize: '16px' }}>
              Loading claims from database...
            </p>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '15px', marginBottom: '20px'
            }}>
              {[
                { icon: '📋', label: 'Total Claims',
                  val: totalClaims, color: '#1B2A4A' },
                { icon: '⏳', label: 'Pending Review',
                  val: pending, color: '#D97706' },
                { icon: '✅', label: 'Approved',
                  val: approved, color: '#059669' },
                { icon: '💰', label: 'Total Payout',
                  val: `₹${totalAmount.toLocaleString('en-IN')}`,
                  color: '#7C3AED' },
              ].map((s, i) => (
                <div key={i} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px', padding: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  borderLeft: `4px solid ${s.color}`
                }}>
                  <div style={{ fontSize: '28px' }}>
                    {s.icon}
                  </div>
                  <div style={{
                    fontSize: '24px', fontWeight: 'bold',
                    color: s.color, margin: '5px 0'
                  }}>
                    {s.val}
                  </div>
                  <div style={{
                    fontSize: '12px', color: '#6B7280'
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart — only show if data exists */}
            {monthlyData.length > 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px', padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ color: '#1B2A4A', marginTop: 0 }}>
                  📊 Claims Overview
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F3F4F6"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar
                      dataKey="claims"
                      name="Total Claims"
                      fill="#1B2A4A"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="approved"
                      name="Approved"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* No claims message */}
            {claims.length === 0 && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px', padding: '50px',
                textAlign: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                marginBottom: '20px'
              }}>
                <div style={{ fontSize: '48px' }}>📋</div>
                <h3 style={{ color: '#1B2A4A' }}>
                  No Claims Yet
                </h3>
                <p style={{ color: '#6B7280' }}>
                  When farmers generate insurance claims
                  they will appear here.
                </p>
                <p style={{ color: '#6B7280', fontSize: '13px' }}>
                  Go to Farmer Dashboard → Get HIGH RISK
                  prediction → Click Generate Insurance Claim
                </p>
              </div>
            )}

            {/* Filter Tabs */}
            {claims.length > 0 && (
              <>
                <div style={{
                  display: 'flex', gap: '10px',
                  marginBottom: '15px'
                }}>
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED']
                    .map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: filter === f
                          ? '#1B2A4A' : '#F3F4F6',
                        color: filter === f
                          ? 'white' : '#374151',
                        border: 'none', borderRadius: '8px',
                        cursor: 'pointer', fontWeight: 'bold',
                        fontSize: '13px'
                      }}
                    >
                      {f === 'ALL' ? '📋 All' :
                       f === 'PENDING' ? '⏳ Pending' :
                       f === 'APPROVED' ? '✅ Approved' :
                       '❌ Rejected'}
                      {' '}({f === 'ALL' ? claims.length :
                        claims.filter(
                          c => c.status === f
                        ).length})
                    </button>
                  ))}
                </div>

                {/* Claims Table */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  overflow: 'hidden', marginBottom: '20px'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#1B2A4A'
                      }}>
                        {['Claim ID', 'Farmer', 'District',
                          'Crop', 'Risk', 'Amount',
                          'Status', 'Action'].map(h => (
                          <th key={h} style={{
                            color: 'white',
                            padding: '12px 15px',
                            fontSize: '12px',
                            textAlign: 'left',
                            fontWeight: 'bold'
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((claim, i) => {
                        const ss = getStatusStyle(claim.status);
                        return (
                          <tr
                            key={i}
                            onClick={() => setSelected(claim)}
                            style={{
                              backgroundColor:
                                selected?.claim_id === claim.claim_id
                                  ? '#F0F9FF'
                                  : i % 2 === 0
                                  ? '#F9FAFB' : 'white',
                              cursor: 'pointer',
                              borderBottom: '1px solid #F3F4F6'
                            }}
                          >
                            <td style={{
                              padding: '12px 15px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              color: '#1B2A4A'
                            }}>
                              {claim.id}
                            </td>
                            <td style={{
                              padding: '12px 15px',
                              fontSize: '13px'
                            }}>
                              {claim.farmer}
                            </td>
                            <td style={{
                              padding: '12px 15px',
                              fontSize: '13px'
                            }}>
                              📍 {claim.district}
                            </td>
                            <td style={{
                              padding: '12px 15px',
                              fontSize: '13px'
                            }}>
                              🌾 {claim.crop}
                            </td>
                            <td style={{
                              padding: '12px 15px'
                            }}>
                              <span style={{
                                fontWeight: 'bold',
                                fontSize: '13px',
                                color: claim.risk >= 80
                                  ? '#DC2626'
                                  : claim.risk >= 60
                                  ? '#D97706' : '#059669'
                              }}>
                                {claim.risk}%
                              </span>
                            </td>
                            <td style={{
                              padding: '12px 15px',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              color: '#059669'
                            }}>
                              {claim.amount}
                            </td>
                            <td style={{
                              padding: '12px 15px'
                            }}>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '20px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                backgroundColor: ss.bg,
                                color: ss.color
                              }}>
                                {claim.status}
                              </span>
                            </td>
                            <td style={{
                              padding: '12px 15px'
                            }}>
                              <div style={{
                                display: 'flex', gap: '5px'
                              }}>
                                {claim.status === 'PENDING' && (
                                  <>
                                    <button
                                      disabled={updating}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(
                                          claim.claim_id,
                                          'APPROVED'
                                        );
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#059669',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                      }}
                                    >
                                      ✅
                                    </button>
                                    <button
                                      disabled={updating}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(
                                          claim.claim_id,
                                          'REJECTED'
                                        );
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        backgroundColor: '#DC2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                      }}
                                    >
                                      ❌
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelected(claim);
                                  }}
                                  style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#1B2A4A',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  👁️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Claim Detail */}
                {selected && (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px', padding: '25px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    border: '2px solid #1B2A4A',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{
                        margin: 0, color: '#1B2A4A'
                      }}>
                        📋 Claim Detail — {selected.id}
                      </h3>
                      <button
                        onClick={() => setSelected(null)}
                        style={{
                          backgroundColor: '#F3F4F6',
                          border: 'none', borderRadius: '6px',
                          padding: '6px 12px', cursor: 'pointer'
                        }}
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px', marginBottom: '20px'
                    }}>
                      {[
                        { label: 'Farmer',
                          val: selected.farmer },
                        { label: 'Phone',
                          val: selected.phone },
                        { label: 'District',
                          val: selected.district },
                        { label: 'Crop',
                          val: selected.crop },
                        { label: 'Land Size',
                          val: `${selected.land_size} acres` },
                        { label: 'Risk Score',
                          val: `${selected.risk}%` },
                        { label: 'Compensation',
                          val: selected.amount },
                        { label: 'Filed Date',
                          val: selected.date },
                        { label: 'Current Status',
                          val: selected.status },
                      ].map((item, i) => (
                        <div key={i} style={{
                          backgroundColor: '#F9FAFB',
                          borderRadius: '8px', padding: '12px'
                        }}>
                          <div style={{
                            fontSize: '11px', color: '#6B7280',
                            marginBottom: '4px'
                          }}>
                            {item.label}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 'bold', color: '#1B2A4A'
                          }}>
                            {item.val}
                          </div>
                        </div>
                      ))}
                    </div>

                    {selected.status === 'PENDING' && (
                      <div style={{
                        display: 'flex', gap: '12px'
                      }}>
                        <button
                          disabled={updating}
                          onClick={() => handleStatusChange(
                            selected.claim_id, 'APPROVED'
                          )}
                          style={{
                            flex: 1, padding: '12px',
                            backgroundColor: '#059669',
                            color: 'white', border: 'none',
                            borderRadius: '8px', fontSize: '14px',
                            fontWeight: 'bold', cursor: 'pointer'
                          }}
                        >
                          {updating
                            ? '⏳ Processing...'
                            : '✅ Approve Claim'}
                        </button>
                        <button
                          disabled={updating}
                          onClick={() => handleStatusChange(
                            selected.claim_id, 'REJECTED'
                          )}
                          style={{
                            flex: 1, padding: '12px',
                            backgroundColor: '#DC2626',
                            color: 'white', border: 'none',
                            borderRadius: '8px', fontSize: '14px',
                            fontWeight: 'bold', cursor: 'pointer'
                          }}
                        >
                          {updating
                            ? '⏳ Processing...'
                            : '❌ Reject Claim'}
                        </button>
                      </div>
                    )}

                    {selected.status !== 'PENDING' && (
                      <div style={{
                        backgroundColor: getStatusStyle(
                          selected.status
                        ).bg,
                        borderRadius: '8px', padding: '15px',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          margin: 0, fontWeight: 'bold',
                          color: getStatusStyle(
                            selected.status
                          ).color, fontSize: '15px'
                        }}>
                          This claim has been {selected.status}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default InsuranceDashboard;
