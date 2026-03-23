import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useTranslation from '../useTranslation';
import { theme } from '../theme';
import { PrimaryButton, InputField, ErrorAlert } from '../components/UI';

// Default English texts — auto translated
const DEFAULT = {
  loginTitle: 'Welcome Back',
  loginSub: 'Sign in to your SmartCrop account',
  phone: 'Phone Number',
  password: 'Password',
  phonePlaceholder: 'Enter your phone number',
  passwordPlaceholder: 'Enter your password',
  loginButton: 'Login',
  loginLoading: 'Signing in...',
  noAccount: 'New farmer?',
  createAccount: 'Create Account',
  invalidLogin: 'Invalid phone number or password',
  fillFields: 'Please fill in all fields',
  changeLanguage: 'Change Language',
};

function Login() {
  const navigate = useNavigate();
  const { texts: t, loading: translating, lang } =
    useTranslation(DEFAULT, 'login');

  const [form, setForm] = useState({
    phone: '', password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.phone || !form.password) {
      setError(t.fillFields); return;
    }
    setLoading(true); setError('');
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/login', form
      );
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',
        JSON.stringify(res.data.user));
      navigate(res.data.has_profile
        ? '/dashboard' : '/profile-setup');
    } catch {
      setError(t.invalidLogin);
    }
    setLoading(false);
  };

  // Loading screen while translating
  if (translating) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg,
          ${theme.colors.primary} 0%, #0f2744 100%)`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            🌾
          </div>
          <div style={{
            width: '36px', height: '36px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <p style={{ opacity: 0.7, fontSize: '14px' }}>
            Loading {lang}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg,
        ${theme.colors.primary} 0%, #0f2744 100%)`,
      display: 'flex',
      fontFamily: "'Segoe UI', sans-serif",
      overflow: 'hidden'
    }}>

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px', color: 'white',
      }}>
        <div style={{ animation: 'slideIn 0.5s ease' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            🌾
          </div>
          <h1 style={{
            fontSize: '42px', fontWeight: '800',
            marginBottom: '12px', lineHeight: 1.1
          }}>
            SmartCrop
          </h1>
          <p style={{
            fontSize: '18px', opacity: 0.7,
            marginBottom: '40px', lineHeight: 1.6
          }}>
            AI-Powered Crop Failure Prediction &
            Micro-Insurance Automation
          </p>
          {[
            { icon: '🧠', text: '99.95% ML Accuracy' },
            { icon: '🌍', text: '6 Regional Languages' },
            { icon: '🛡️', text: 'Auto Insurance Claims' },
            { icon: '🌤️', text: 'Real-time Weather' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              gap: '12px', marginBottom: '14px',
              animation: `fadeIn 0.4s ease ${i * 0.1}s both`
            }}>
              <div style={{
                width: '36px', height: '36px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '18px'
              }}>
                {f.icon}
              </div>
              <span style={{ fontSize: '15px', opacity: 0.85 }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: '420px', backgroundColor: 'white',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px 40px',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.2)',
        animation: 'slideIn 0.4s ease'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '32px'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px', fontWeight: '800',
              color: theme.colors.textPrimary,
              marginBottom: '4px'
            }}>
              {t.loginTitle}
            </h2>
            <p style={{
              color: theme.colors.textMuted, fontSize: '13px'
            }}>
              {t.loginSub}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('language');
              navigate('/language');
            }}
            style={{
              backgroundColor: '#f0f4f8', border: 'none',
              borderRadius: '20px', padding: '6px 12px',
              cursor: 'pointer', fontSize: '12px',
              color: theme.colors.textSecondary,
              fontWeight: '600'
            }}
          >
            🌐 {lang}
          </button>
        </div>

        <ErrorAlert message={error} />

        <InputField
          label={t.phone}
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder={t.phonePlaceholder}
          icon="📱"
        />

        <InputField
          label={t.password}
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder={t.passwordPlaceholder}
          icon="🔒"
        />

        <div style={{ marginTop: '8px' }}>
          <PrimaryButton
            onClick={handleLogin}
            loading={loading}
            color={theme.colors.primary}
          >
            🔐 {t.loginButton}
          </PrimaryButton>
        </div>

        <p style={{
          textAlign: 'center', marginTop: '20px',
          color: theme.colors.textMuted, fontSize: '14px'
        }}>
          {t.noAccount}{' '}
          <span
            onClick={() => navigate('/register')}
            style={{
              color: theme.colors.secondary,
              fontWeight: '700', cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {t.createAccount}
          </span>
        </p>

        <p style={{
          textAlign: 'center', marginTop: '8px',
          fontSize: '12px'
        }}>
          <span
            onClick={() => {
              localStorage.removeItem('language');
              navigate('/language');
            }}
            style={{
              color: theme.colors.textMuted,
              cursor: 'pointer', textDecoration: 'underline'
            }}
          >
            🌐 {t.changeLanguage}
          </span>
        </p>

        <p style={{
          textAlign: 'center', marginTop: '32px',
          color: theme.colors.textMuted, fontSize: '11px',
          borderTop: `1px solid ${theme.colors.border}`,
          paddingTop: '20px'
        }}>
          Sri Krishna College of Technology
          <br />SmartCrop v2.0 • CSE Department
        </p>
      </div>
    </div>
  );
}

export default Login;