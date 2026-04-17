import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { SocketProvider } from './lib/SocketContext';
import Login from './pages/Login';
import Chats from './pages/Chats';
import ChatBox from './pages/ChatBox';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import './index.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
            <Route path="/chat/:chatId" element={<ProtectedRoute><ChatBox /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
