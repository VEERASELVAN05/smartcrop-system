import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { globalStyles } from './theme';

// Inject global styles
const styleEl = document.createElement('style');
styleEl.textContent = globalStyles;
document.head.appendChild(styleEl);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);