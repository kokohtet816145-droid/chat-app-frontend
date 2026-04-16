cd ~/chat-app/frontend
cat > src/App.js << 'EOF'
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card w-96 bg-white shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Login Page</h2>
          <p className="text-gray-500">Tailwind + DaisyUI is working!</p>
          <button className="btn btn-primary">Test Button</button>
        </div>
      </div>
    </div>
  );
}

function Chats() {
  return <div className="p-4"><h2 className="text-xl font-bold">Chats Page</h2></div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
EDF
