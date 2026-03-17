import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import translations from "../translations";
import { getOptions } from "../optionTranslations";
import optionTranslations from "../optionTranslations";

const DISTRICTS = [
  "Coimbatore",
  "Chennai",
  "Madurai",
  "Thanjavur",
  "Salem",
  "Tirunelveli",
  "Trichy",
  "Erode",
  "Tiruppur",
  "Vellore",
  "Dindigul",
  "Kanchipuram",
];

function Register() {
  const navigate = useNavigate();
  const lang = localStorage.getItem("language") || "English";
  const t = translations[lang];
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

  const inputStyle = {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "14px",
    boxSizing: "border-box",
    marginTop: "6px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "40px",
          width: "420px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{ fontSize: "48px" }}>👨‍🌾</div>
          <h1 style={{ color: "#1B2A4A", margin: "10px 0 5px" }}>
            {t.registerTitle}
          </h1>
          <p style={{ color: "#6B7280", margin: 0, fontSize: "14px" }}>
            {t.registerSub}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              backgroundColor: "#FEE2E2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "15px",
              color: "#DC2626",
              fontSize: "14px",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Full Name */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ fontWeight: "bold", color: "#374151", fontSize: "14px" }}
          >
            👤 {t.fullName}
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t.namePlaceholder}
            style={inputStyle}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ fontWeight: "bold", color: "#374151", fontSize: "14px" }}
          >
            📱 {t.phone}
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder={t.phonePlaceholder}
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ fontWeight: "bold", color: "#374151", fontSize: "14px" }}
          >
            🔒 {t.password}
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder={t.passwordPlaceholder}
            style={inputStyle}
          />
        </div>

        {/* District */}
        <div style={{ marginBottom: "25px" }}>
          <label
            style={{ fontWeight: "bold", color: "#374151", fontSize: "14px" }}
          >
            📍 {t.district}
          </label>
          <select
            name="district"
            value={form.district}
            onChange={handleChange}
            style={{ ...inputStyle, backgroundColor: "white" }}
          >
            <option value="">{t.selectDistrict}</option>
            {options.districts.map((d, i) => (
              <option
                key={optionTranslations["English"].districts[i]}
                value={optionTranslations["English"].districts[i]}
              >
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Register Button */}
        <button
          onClick={handleRegister}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: "#2C7A3F",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading ? t.createLoading : `✅ ${t.createButton}`}
        </button>

        {/* Login Link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#6B7280",
            fontSize: "14px",
          }}
        >
          {t.alreadyAccount}{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#1B2A4A", fontWeight: "bold", cursor: "pointer" }}
          >
            {t.loginHere}
          </span>
        </p>

        {/* Change Language */}
        <p style={{ textAlign: "center", marginTop: "8px" }}>
          <span
            onClick={() => {
              localStorage.removeItem("language");
              navigate("/");
            }}
            style={{
              color: "#9CA3AF",
              fontSize: "12px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            🌐 {t.changeLanguage}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
