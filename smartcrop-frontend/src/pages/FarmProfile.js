import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import translations from '../translations';
import { getOptions } from '../optionTranslations';
import optionTranslations from '../optionTranslations';
import { theme } from '../theme';
import {
  PrimaryButton, SelectField,
  InputField, ErrorAlert
} from '../components/UI';
import useTranslation from '../useTranslation';


const DEFAULT = {
  farmTitle: 'Farm Profile Setup',
  farmSub: 'Tell us about your farm',
  stepOf: 'Step',
  of: 'of',
  whatGrow: 'What do you grow?',
  cropType: 'Crop Type',
  selectCrop: 'Select crop',
  landSize: 'Land Size (acres)',
  aboutSoil: 'Tell us about your soil',
  soilType: 'Soil Type',
  selectSoil: 'Select soil type',
  irrigationType: 'Irrigation Type',
  selectIrrigation: 'Select irrigation',
  seasonLocation: 'Season & Location',
  sowingSeason: 'Sowing Season',
  selectSeason: 'Select season',
  selectDistrict: 'Select district',
  district: 'District',
  village: 'Village / Town',
  villagePlaceholder: 'e.g. Sulur',
  back: 'Back',
  next: 'Next',
  saveProfile: 'Save Farm Profile',
  saving: 'Saving...',
  fillFields: 'Please fill all fields',
};

function FarmProfile() {
  const navigate = useNavigate();
  const { texts: t, loading: translating, lang } =
  useTranslation(DEFAULT, 'farmprofile');
  const options = getOptions(lang);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    crop_type: '', land_size: '',
    soil_type: '', irrigation_type: '',
    sowing_season: '', district: '', village: ''
  });

  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  );
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    if (step === 1 && (!form.crop_type || !form.land_size)) {
      setError('Please fill all fields'); return false;
    }
    if (step === 2 &&
        (!form.soil_type || !form.irrigation_type)) {
      setError('Please fill all fields'); return false;
    }
    if (step === 3 &&
        (!form.sowing_season || !form.district ||
         !form.village)) {
      setError('Please fill all fields'); return false;
    }
    setError(''); return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    try {
      const currentToken = localStorage.getItem('token');
      await axios.post(
        'http://127.0.0.1:8000/profile',
        { ...form, land_size: parseFloat(form.land_size) },
        {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Error saving profile. Try again.');
      }
    }
    setLoading(false);
  };

  const steps = [
    { title: t.whatGrow || 'What do you grow?',     icon: '🌾' },
    { title: t.aboutSoil || 'About your soil',      icon: '🧪' },
    { title: t.seasonLocation || 'Season & Location', icon: '📍' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg,
        ${theme.colors.primary} 0%,
        #0f2744 100%)`,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      padding: '20px'
    }}>
      <div style={{
        width: '100%', maxWidth: '520px',
        animation: 'fadeIn 0.4s ease'
      }}>

        {/* Header */}
        <div style={{
          textAlign: 'center', marginBottom: '24px'
        }}>
          <div style={{
            width: '64px', height: '64px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: '28px',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            🌱
          </div>
          <h2 style={{
            color: 'white', fontSize: '22px',
            fontWeight: '800', marginBottom: '4px'
          }}>
            {t.farmTitle}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '13px'
          }}>
            {t.farmSub} — {user.name}
          </p>
        </div>

        {/* Step Indicators */}
        <div style={{
          display: 'flex', alignItems: 'center',
          marginBottom: '20px', gap: '4px'
        }}>
          {steps.map((s, i) => (
            <>
              <div key={i} style={{
                flex: 1, display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', gap: '6px'
              }}>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  backgroundColor: i + 1 <= step
                    ? 'white'
                    : 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: i + 1 < step ? '16px' : '14px',
                  fontWeight: '700',
                  color: i + 1 <= step
                    ? theme.colors.primary : 'white',
                  transition: 'all 0.3s ease',
                  boxShadow: i + 1 === step
                    ? '0 0 0 4px rgba(255,255,255,0.3)'
                    : 'none'
                }}>
                  {i + 1 < step ? '✓' : s.icon}
                </div>
                <span style={{
                  color: i + 1 <= step
                    ? 'white' : 'rgba(255,255,255,0.4)',
                  fontSize: '10px', fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  Step {i + 1}
                </span>
              </div>
              {i < 2 && (
                <div key={`line-${i}`} style={{
                  flex: 2, height: '2px',
                  backgroundColor: i + 1 < step
                    ? 'white' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease',
                  marginBottom: '22px'
                }} />
              )}
            </>
          ))}
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px', padding: '28px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'fadeIn 0.3s ease'
        }}>
          <h3 style={{
            color: theme.colors.textPrimary,
            fontSize: '18px', fontWeight: '700',
            marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            {steps[step - 1].icon} {steps[step - 1].title}
          </h3>

          <ErrorAlert message={error} />

          {/* Step 1 */}
          {step === 1 && (
            <>
              <SelectField
                label={t.cropType}
                name="crop_type"
                value={form.crop_type}
                onChange={handleChange}
                placeholder={t.selectCrop}
                icon="🌾"
                options={options.crops.map((c, i) => ({
                  label: c,
                  value: optionTranslations['English'].crops[i]
                }))}
              />
              <InputField
                label={t.landSize}
                name="land_size"
                type="number"
                value={form.land_size}
                onChange={handleChange}
                placeholder="e.g. 2.5"
                icon="📐"
              />
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <SelectField
                label={t.soilType}
                name="soil_type"
                value={form.soil_type}
                onChange={handleChange}
                placeholder={t.selectSoil}
                icon="🧪"
                options={options.soils.map((s, i) => ({
                  label: s,
                  value: optionTranslations['English'].soils[i]
                }))}
              />
              <SelectField
                label={t.irrigationType}
                name="irrigation_type"
                value={form.irrigation_type}
                onChange={handleChange}
                placeholder={t.selectIrrigation}
                icon="💧"
                options={options.irrigations.map((ir, i) => ({
                  label: ir,
                  value: optionTranslations['English']
                           .irrigations[i]
                }))}
              />
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <SelectField
                label={t.sowingSeason}
                name="sowing_season"
                value={form.sowing_season}
                onChange={handleChange}
                placeholder={t.selectSeason}
                icon="🌱"
                options={options.seasons.map((s, i) => ({
                  label: s,
                  value: options.seasonValues[i]
                }))}
              />
              <SelectField
                label={t.district}
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder={t.selectDistrict || 'Select district'}
                icon="📍"
                options={options.districts.map((d, i) => ({
                  label: d,
                  value: optionTranslations['English'].districts[i]
                }))}
              />
              <InputField
                label={t.village}
                name="village"
                value={form.village}
                onChange={handleChange}
                placeholder={t.villagePlaceholder}
                icon="🏘️"
              />
            </>
          )}

          {/* Buttons */}
          <div style={{
            display: 'flex', gap: '12px', marginTop: '24px'
          }}>
            {step > 1 && (
              <button
                onClick={() => {
                  setStep(step - 1);
                  setError('');
                }}
                style={{
                  flex: 1, padding: '13px',
                  backgroundColor: '#f0f4f8',
                  color: theme.colors.textSecondary,
                  border: `1.5px solid ${theme.colors.border}`,
                  borderRadius: theme.radius.md,
                  fontSize: '14px', cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                ← {t.back}
              </button>
            )}
            {step < 3 ? (
              <PrimaryButton
                onClick={handleNext}
                color={theme.colors.primary}
              >
                {t.next} →
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={handleSubmit}
                loading={loading}
                color={theme.colors.secondary}
              >
                ✅ {t.saveProfile}
              </PrimaryButton>
            )}
          </div>
        </div>

        <p style={{
          textAlign: 'center', marginTop: '16px',
          color: 'rgba(255,255,255,0.4)', fontSize: '12px'
        }}>
          {t.stepOf} {step} {t.of} 3 •
          SmartCrop v2.0
        </p>
      </div>
    </div>
  );
}

export default FarmProfile;