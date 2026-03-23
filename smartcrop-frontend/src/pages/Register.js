import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import translations from "../translations";
import { getOptions } from "../optionTranslations";
import optionTranslations from "../optionTranslations";
import { theme } from "../theme";
import {
  PrimaryButton,
  InputField,
  SelectField,
  ErrorAlert,
} from "../components/UI";
import useTranslation from "../useTranslation";

const DEFAULT = {
  registerTitle: "Create Account",
  registerSub: "Join SmartCrop — protect your harvest",
  fullName: "Full Name",
  phone: "Phone Number",
  password: "Password",
  district: "District",
  phonePlaceholder: "Enter your phone number",
  passwordPlaceholder: "Enter your password",
  namePlaceholder: "e.g. Ravi Kumar",
  selectDistrict: "Select your district",
  createButton: "Create Account",
  createLoading: "Creating account...",
  alreadyAccount: "Already have an account?",
  loginHere: "Login here",
  phoneTenDigits: "Phone must be 10 digits",
  fillFields: "Please fill all fields",
  changeLanguage: "Change Language",
};

function Register() {
  const navigate = useNavigate();
  const {
    texts: t,
    loading: translating,
    lang,
  } = useTranslation(DEFAULT, "register");
  const options = getOptions(lang);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    district: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.district || !form.password) {
      setError(t.fillFields);
      return;
    }
    if (form.phone.length !== 10) {
      setError(t.phoneTenDigits);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/register", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/profile-setup");
    } catch (err) {
      setError(err.response?.data?.detail || t.fillFields);
    }
    setLoading(false);
  };

  if (translating) {
  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg,
        ${theme.colors.primary} 0%, #0f2744 100%)`,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '48px' }}>🌾</div>
        <div style={{
          width: '36px', height: '36px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '16px auto'
        }} />
        <p style={{ opacity: 0.7 }}>Loading {lang}...</p>
      </div>
    </div>
  );
}
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, 
        ${theme.colors.primary} 0%, 
        #0f2744 100%)`,
        display: "flex",
        fontFamily: "'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          color: "white",
        }}
      >
        <div style={{ animation: "slideIn 0.5s ease" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👨‍🌾</div>
          <h1
            style={{
              fontSize: "38px",
              fontWeight: "800",
              marginBottom: "12px",
              lineHeight: 1.1,
            }}
          >
            Join SmartCrop
          </h1>
          <p
            style={{
              fontSize: "16px",
              opacity: 0.7,
              marginBottom: "40px",
              lineHeight: 1.6,
            }}
          >
            Protect your harvest with AI-powered crop failure prediction
          </p>

          {[
            { icon: "🆓", text: "Completely Free to Use" },
            { icon: "📱", text: "Works in Your Language" },
            { icon: "⚡", text: "Instant Risk Assessment" },
            { icon: "🛡️", text: "Auto Insurance Claims" },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "14px",
                animation: `fadeIn 0.4s ease ${i * 0.1}s both`,
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                {f.icon}
              </div>
              <span
                style={{
                  fontSize: "15px",
                  opacity: 0.85,
                }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          width: "440px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px 40px",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.2)",
          overflowY: "auto",
          animation: "slideIn 0.4s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: theme.colors.textPrimary,
                marginBottom: "4px",
              }}
            >
              {t.registerTitle}
            </h2>
            <p
              style={{
                color: theme.colors.textMuted,
                fontSize: "13px",
              }}
            >
              {t.registerSub}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("language");
              navigate("/");
            }}
            style={{
              backgroundColor: "#f0f4f8",
              border: "none",
              borderRadius: "20px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "12px",
              color: theme.colors.textSecondary,
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            🌐 {lang}
          </button>
        </div>

        <ErrorAlert message={error} />

        <InputField
          label={t.fullName}
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={t.namePlaceholder}
          icon="👤"
        />

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

        <SelectField
          label={t.district}
          name="district"
          value={form.district}
          onChange={handleChange}
          placeholder={t.selectDistrict}
          icon="📍"
          options={options.districts.map((d, i) => ({
            label: d,
            value: optionTranslations["English"].districts[i],
          }))}
        />

        <div style={{ marginTop: "8px" }}>
          <PrimaryButton
            onClick={handleRegister}
            loading={loading}
            color={theme.colors.secondary}
          >
            ✅ {t.createButton}
          </PrimaryButton>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: theme.colors.textMuted,
            fontSize: "14px",
          }}
        >
          {t.alreadyAccount}{" "}
          <span
            onClick={() => navigate("/login")}
            style={{
              color: theme.colors.primary,
              fontWeight: "700",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {t.loginHere}
          </span>
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: "8px",
            fontSize: "12px",
          }}
        >
          <span
            onClick={() => {
              localStorage.removeItem("language");
              navigate("/");
            }}
            style={{
              color: theme.colors.textMuted,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            🌐 {t.changeLanguage}
          </span>
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: theme.colors.textMuted,
            fontSize: "11px",
            borderTop: `1px solid ${theme.colors.border}`,
            paddingTop: "20px",
          }}
        >
          Sri Krishna College of Technology
          <br />
          SmartCrop v2.0 • CSE Department
        </p>
      </div>
    </div>
  );
}

export default Register;
