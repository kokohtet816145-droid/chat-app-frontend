import React, { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with:', username, password);
    alert('Login လုပ်မည် (Auth မချိတ်ရသေးပါ)');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="anime-girl-placeholder">
          <img 
            src="https://i.pinimg.com/originals/3f/7b/5c/3f7b5c9c9c9c9c9c9c9c9c9c9c9c9c9c.gif" 
            alt="Anime Girl" 
            className="anime-girl"
          />
        </div>
        <h2>Chat App Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">ဝင်ရောက်မည်</button>
        </form>
      </div>
    </div>
  );
}

export default App;
