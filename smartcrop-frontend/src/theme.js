export const theme = {
  colors: {
    primary: '#1a3c5e',      // Deep navy
    primaryLight: '#2d5986', // Lighter navy
    secondary: '#2d8a4e',    // Forest green
    secondaryLight: '#3aad64',
    accent: '#f0a500',       // Golden amber
    danger: '#e53935',
    warning: '#f57c00',
    success: '#2e7d32',
    white: '#ffffff',
    background: '#f0f4f8',
    cardBg: '#ffffff',
    border: '#e2e8f0',
    textPrimary: '#1a202c',
    textSecondary: '#4a5568',
    textMuted: '#718096',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.1)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
    xl: '0 16px 40px rgba(0,0,0,0.15)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  }
};

export const globalStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 
                 sans-serif;
    background: #f0f4f8;
    color: #1a202c;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.05); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }

  .fade-in {
    animation: fadeIn 0.4s ease forwards;
  }

  .slide-in {
    animation: slideIn 0.3s ease forwards;
  }

  button:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
    transition: all 0.2s ease;
  }

  button:active {
    transform: translateY(0px);
  }

  input:focus {
    outline: none;
    border-color: #2d5986 !important;
    box-shadow: 0 0 0 3px rgba(45,89,134,0.15) !important;
  }

  select:focus {
    outline: none;
    border-color: #2d5986 !important;
    box-shadow: 0 0 0 3px rgba(45,89,134,0.15) !important;
  }
`;