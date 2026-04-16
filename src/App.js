import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { SocketProvider } from './lib/SocketContext';
import Login from './pages/Login';
import Chats from './pages/Chats';
import ChatBox from './pages/ChatBox';

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color: 'red', padding: 20}}>
        <h1>Error: {this.state.error?.message}</h1>
        <pre>{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
