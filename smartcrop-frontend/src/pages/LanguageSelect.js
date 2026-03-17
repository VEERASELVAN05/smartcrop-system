import { useNavigate } from 'react-router-dom';

const languages = [
  { code: 'Tamil',    name: 'தமிழ்',    english: 'Tamil',    flag: '🌾' },
  { code: 'Telugu',   name: 'తెలుగు',   english: 'Telugu',   flag: '🌿' },
  { code: 'Malayalam',name: 'മലയാളം',  english: 'Malayalam', flag: '🍃' },
  { code: 'Kannada',  name: 'ಕನ್ನಡ',    english: 'Kannada',  flag: '🌱' },
  { code: 'Hindi',    name: 'हिंदी',    english: 'Hindi',    flag: '🌻' },
  { code: 'English',  name: 'English',  english: 'English',  flag: '📖' },
];

function LanguageSelect() {
  const navigate = useNavigate();

  const handleSelect = (langCode) => {
  localStorage.setItem('language', langCode);

  // Check if user already logged in
  const token = localStorage.getItem('token');
  if (token) {
    // Already logged in — go directly to dashboard
    navigate('/dashboard');
  } else {
    // Not logged in — go to login
    navigate('/login');
  }
};

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1B2A4A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ fontSize: '60px' }}>🌾</div>
          <h1 style={{
            color: 'white', fontSize: '32px',
            margin: '10px 0 5px', fontWeight: 'bold'
          }}>
            SmartCrop
          </h1>
          <p style={{ color: '#9EC8B9', fontSize: '14px', margin: 0 }}>
            AI-Powered Crop Protection
          </p>
        </div>

        {/* Language Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{
            textAlign: 'center', color: '#1B2A4A',
            marginTop: 0, fontSize: '18px'
          }}>
            Choose Your Language
          </h2>
          <p style={{
            textAlign: 'center', color: '#6B7280',
            fontSize: '13px', marginBottom: '25px'
          }}>
            மொழியை தேர்ந்தெடுக்கவும் • భాష ఎంచుకోండి
          </p>

          {/* Language Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                style={{
                  padding: '16px 12px',
                  backgroundColor: '#F9FAFB',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = '#ECFDF5';
                  e.target.style.borderColor = '#2C7A3F';
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = '#F9FAFB';
                  e.target.style.borderColor = '#E5E7EB';
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>
                  {lang.flag}
                </div>
                <div style={{
                  fontSize: '16px', fontWeight: 'bold',
                  color: '#1B2A4A', marginBottom: '3px'
                }}>
                  {lang.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {lang.english}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Add this below the language grid */}
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '8px',
          padding: '10px',
          marginTop: '15px',
          textAlign: 'center'
        }}>
          <p style={{
            margin: 0, fontSize: '12px', color: '#065F46'
          }}>
            🤖 Powered by AI Translation —
            entire app automatically translates
            to your chosen language
          </p>
        </div>

        <p style={{
          textAlign: 'center', color: '#6B7280',
          fontSize: '12px', marginTop: '20px'
        }}>
          Sri Krishna College of Technology
        </p>
      </div>
    </div>
  );
}

export default LanguageSelect;