import { useNavigate } from 'react-router-dom';
import { theme, globalStyles } from '../theme';

const languages = [
  { code: 'Tamil',     native: 'தமிழ்',   english: 'Tamil',     flag: '🌾', color: '#e65100' },
  { code: 'Telugu',    native: 'తెలుగు',  english: 'Telugu',    flag: '🌿', color: '#2e7d32' },
  { code: 'Malayalam', native: 'മലയാളം', english: 'Malayalam', flag: '🍃', color: '#1565c0' },
  { code: 'Kannada',   native: 'ಕನ್ನಡ',   english: 'Kannada',   flag: '🌱', color: '#6a1b9a' },
  { code: 'Hindi',     native: 'हिंदी',   english: 'Hindi',     flag: '🌻', color: '#c62828' },
  { code: 'English',   native: 'English',  english: 'English',   flag: '📖', color: '#1a3c5e' },
];

function LanguageSelect() {
  const navigate = useNavigate();

  const handleSelect = (langCode) => {
    localStorage.setItem('language', langCode);
    const token = localStorage.getItem('token');
    navigate(token ? '/dashboard' : '/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, 
        ${theme.colors.primary} 0%, 
        #0f2744 50%, 
        #1a3c5e 100%)`,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '20px',
      position: 'relative', overflow: 'hidden'
    }}>

      {/* Background decorations */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: '400px', height: '400px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '300px', height: '300px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '50%'
      }} />

      <div style={{
        width: '100%', maxWidth: '480px',
        animation: 'fadeIn 0.5s ease'
      }}>

        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '36px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: '2px solid rgba(255,255,255,0.15)'
          }}>
            🌾
          </div>
          <h1 style={{
            color: 'white', fontSize: '32px',
            fontWeight: '800', margin: '0 0 6px',
            letterSpacing: '-0.5px'
          }}>
            SmartCrop
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px', margin: 0
          }}>
            AI-Powered Crop Protection System
          </p>
        </div>

        {/* Language Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px', padding: '28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{
            textAlign: 'center', color: theme.colors.textPrimary,
            fontSize: '18px', fontWeight: '700',
            marginBottom: '6px'
          }}>
            Choose Your Language
          </h2>
          <p style={{
            textAlign: 'center', color: theme.colors.textMuted,
            fontSize: '13px', marginBottom: '24px'
          }}>
            மொழியை தேர்ந்தெடுக்கவும் • భాష ఎంచుకోండి
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  padding: '14px 12px',
                  backgroundColor: '#fafbfc',
                  border: `2px solid ${theme.colors.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = `${lang.color}10`;
                  e.currentTarget.style.borderColor = lang.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${lang.color}30`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fafbfc';
                  e.currentTarget.style.borderColor = theme.colors.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '26px', marginBottom: '6px' }}>
                  {lang.flag}
                </div>
                <div style={{
                  fontSize: '16px', fontWeight: '700',
                  color: theme.colors.textPrimary,
                  marginBottom: '2px'
                }}>
                  {lang.native}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: theme.colors.textMuted
                }}>
                  {lang.english}
                </div>
              </button>
            ))}
          </div>

          <div style={{
            marginTop: '20px', padding: '12px 16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '10px', textAlign: 'center',
            border: '1px solid #bae6fd'
          }}>
            <p style={{
              margin: 0, fontSize: '12px', color: '#0369a1',
              fontWeight: '500'
            }}>
              🤖 AI-powered translation • Entire app changes language
            </p>
          </div>
        </div>

        <p style={{
          textAlign: 'center', color: 'rgba(255,255,255,0.4)',
          fontSize: '12px', marginTop: '20px'
        }}>
          Sri Krishna College of Technology, Coimbatore
        </p>
      </div>
    </div>
  );
}

export default LanguageSelect;