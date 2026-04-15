import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Global Error Handler
window.onerror = function(message, source, lineno, colno, error) {
  document.body.innerHTML = `
    <div style="padding:20px; color:red; background:#fee; font-family:monospace;">
      <h2>Runtime Error Occurred</h2>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Source:</strong> ${source}:${lineno}:${colno}</p>
      <p><strong>Stack:</strong> ${error ? error.stack : 'N/A'}</p>
    </div>
  `;
  return true;
};

// Also catch unhandled promise rejections
window.onunhandledrejection = function(event) {
  document.body.innerHTML = `
    <div style="padding:20px; color:red; background:#fee;">
      <h2>Unhandled Promise Rejection</h2>
      <p><strong>Reason:</strong> ${event.reason}</p>
    </div>
  `;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
