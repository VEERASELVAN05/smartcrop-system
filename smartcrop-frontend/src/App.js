import { useState } from 'react';

function App() {
  const [form, setForm] = useState({
    N: '', P: '', K: '',
    temperature: '', humidity: '',
    ph: '', rainfall: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    // Check all fields filled
    for (let key in form) {
      if (form[key] === '') {
        alert(`Please fill in ${key}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          N: parseFloat(form.N),
          P: parseFloat(form.P),
          K: parseFloat(form.K),
          temperature: parseFloat(form.temperature),
          humidity: parseFloat(form.humidity),
          ph: parseFloat(form.ph),
          rainfall: parseFloat(form.rainfall)
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert('Error: Make sure FastAPI is running!');
    }
    setLoading(false);
  };

  const getColors = (color) => {
    if (color === 'green') 
      return { bg: '#d5f5e3', border: '#27ae60', text: '#27ae60' };
    if (color === 'yellow') 
      return { bg: '#fef9e7', border: '#f39c12', text: '#f39c12' };
    return { bg: '#fadbd8', border: '#e74c3c', text: '#e74c3c' };
  };

  return (
    <div style={{ minHeight: '100vh', 
                  backgroundColor: '#f5f6fa',
                  fontFamily: 'Arial' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: '#1B2A4A', 
                    padding: '20px', 
                    textAlign: 'center' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '28px' }}>
          🌾 SmartCrop System
        </h1>
        <p style={{ color: '#aaa', margin: '5px 0 0' }}>
          AI-Powered Crop Failure Prediction & 
          Micro-Insurance Automation
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '700px', 
                    margin: '40px auto', 
                    padding: '0 20px' }}>

        {/* Form Card */}
        <div style={{ backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '30px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          
          <h2 style={{ color: '#1B2A4A', marginTop: 0 }}>
            Enter Farm Data
          </h2>
          <p style={{ color: '#666' }}>
            Fill in your soil and weather details 
            to get your crop risk score
          </p>

          <div style={{ display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '20px' }}>
            {[
              { name: 'N', label: 'Nitrogen (N)', 
                placeholder: 'e.g. 90' },
              { name: 'P', label: 'Phosphorus (P)', 
                placeholder: 'e.g. 42' },
              { name: 'K', label: 'Potassium (K)', 
                placeholder: 'e.g. 43' },
              { name: 'temperature', label: 'Temperature (°C)', 
                placeholder: 'e.g. 25' },
              { name: 'humidity', label: 'Humidity (%)', 
                placeholder: 'e.g. 80' },
              { name: 'ph', label: 'Soil pH', 
                placeholder: 'e.g. 6.5' },
              { name: 'rainfall', label: 'Rainfall (mm)', 
                placeholder: 'e.g. 200' },
            ].map(field => (
              <div key={field.name}>
                <label style={{ fontWeight: 'bold', 
                                color: '#333',
                                fontSize: '14px' }}>
                  {field.label}
                </label>
                <input
                  type="number"
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  style={{ width: '100%', padding: '10px',
                           marginTop: '5px', 
                           borderRadius: '8px',
                           border: '1px solid #ddd',
                           fontSize: '14px',
                           boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handlePredict}
            style={{ width: '100%', padding: '14px',
                     marginTop: '25px',
                     backgroundColor: '#1B2A4A',
                     color: 'white', border: 'none',
                     borderRadius: '8px', fontSize: '16px',
                     cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? '🔄 Analyzing...' : '🔍 Predict Crop Risk'}
          </button>
        </div>

        {/* Result Card */}
        {result && (() => {
          const colors = getColors(result.color);
          return (
            <div style={{ marginTop: '25px', padding: '25px',
                          borderRadius: '12px',
                          backgroundColor: colors.bg,
                          border: `2px solid ${colors.border}`,
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              
              <h2 style={{ textAlign: 'center', 
                           color: '#1B2A4A', marginTop: 0 }}>
                Prediction Result
              </h2>

              {/* Risk Score */}
              <div style={{ textAlign: 'center', 
                            padding: '20px',
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            marginBottom: '15px' }}>
                <div style={{ fontSize: '48px', 
                              fontWeight: 'bold',
                              color: colors.text }}>
                  {result.risk_score}%
                </div>
                <div style={{ fontSize: '22px',
                              fontWeight: 'bold',
                              color: colors.text }}>
                  {result.status}
                </div>
              </div>

              {/* Advice */}
              <div style={{ backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '15px' }}>
                <strong>📋 Advice:</strong>
                <p style={{ margin: '5px 0 0', color: '#333' }}>
                  {result.advice}
                </p>
              </div>

              {/* Insurance Status */}
              <div style={{ backgroundColor: 'white',
                            padding: '15px',
                            borderRadius: '8px' }}>
                <strong>🛡️ Insurance Status:</strong>
                <p style={{ margin: '5px 0 0', 
                            color: colors.text,
                            fontWeight: 'bold' }}>
                  {result.insurance_status}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Footer */}
        <div style={{ textAlign: 'center', 
                      marginTop: '30px',
                      color: '#999', fontSize: '13px' }}>
          <p>Sri Krishna College of Technology | CSE Dept</p>
          <p>Tejasri R | Veeraselvan M | Vinaiprasat V K</p>
          <p>Guided by Ms. S. Vidhya</p>
        </div>
      </div>
    </div>
  );
}

export default App;