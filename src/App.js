import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { SocketProvider } from './lib/SocketContext';
import Login from './pages/Login';
import Chats from './pages/Chats';
import ChatBox from './pages/ChatBox';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/chat/:chatId" element={<ChatBox />} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
