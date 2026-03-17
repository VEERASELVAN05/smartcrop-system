import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import translations from '../translations';
import { getOptions } from '../optionTranslations';

function Login() {
  const navigate = useNavigate();
  const lang = localStorage.getItem('language') || 'English';

  const t = translations[lang] || translations['English'];
  const options = getOptions(lang);

  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.phone || !form.password) {
      setError(t.fillFields);
      return;
    }
    setLoading(true);
    setError('');
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

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F5F7FA',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'Arial'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '16px',
        padding: '40px', width: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>

        {/* Language indicator */}
        <div style={{
          textAlign: 'right', marginBottom: '10px'
        }}>
          <span style={{
            backgroundColor: '#ECFDF5',
            color: '#065F46', padding: '4px 10px',
            borderRadius: '20px', fontSize: '12px',
            fontWeight: 'bold'
          }}>
            🌐 {lang}
          </span>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px' }}>🌾</div>
          <h1 style={{ color: '#1B2A4A', margin: '10px 0 5px' }}>
            SmartCrop
          </h1>
          <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>
            {t.loginSub}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '8px', padding: '10px',
            marginBottom: '15px', color: '#DC2626',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Phone */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{
            display: 'block', marginBottom: '6px',
            fontWeight: 'bold', color: '#374151',
            fontSize: '14px'
          }}>
            📱 {t.phone}
          </label>
          <input
            type="text" name="phone"
            value={form.phone} onChange={handleChange}
            placeholder={t.phonePlaceholder}
            style={{
              width: '100%', padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block', marginBottom: '6px',
            fontWeight: 'bold', color: '#374151',
            fontSize: '14px'
          }}>
            🔒 {t.password}
          </label>
          <input
            type="password" name="password"
            value={form.password} onChange={handleChange}
            placeholder={t.passwordPlaceholder}
            style={{
              width: '100%', padding: '12px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            width: '100%', padding: '14px',
            backgroundColor: '#1B2A4A',
            color: 'white', border: 'none',
            borderRadius: '8px', fontSize: '16px',
            fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          {loading ? t.loginLoading : `🔐 ${t.loginButton}`}
        </button>

        {/* Register Link */}
        <p style={{
          textAlign: 'center', marginTop: '20px',
          color: '#6B7280', fontSize: '14px'
        }}>
          {t.noAccount}{' '}
          <span
            onClick={() => navigate('/register')}
            style={{
              color: '#2C7A3F', fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {t.createAccount}
          </span>
        </p>

        {/* Change Language */}
        <p style={{ textAlign: 'center', marginTop: '8px' }}>
          <span
            onClick={() => {
              localStorage.removeItem('language');
              navigate('/');
            }}
            style={{
              color: '#9CA3AF', fontSize: '12px',
              cursor: 'pointer', textDecoration: 'underline'
            }}
          >
            🌐 {t.changeLanguage}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;