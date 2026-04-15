import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import VConsole from 'vconsole';

const vConsole = new VConsole();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
