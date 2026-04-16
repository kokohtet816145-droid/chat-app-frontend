import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { SocketProvider } from './lib/SocketContext';
import Login from './pages/Login';
import Chats from './pages/Chats';
import ChatBox from './pages/ChatBox';

// Simple Error Boundary to catch runtime errors
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
    console.error('Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '20px', background: '#fee', minHeight: '100vh' }}>
          <h1>Something went wrong.</h1>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Stack trace</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
        </div>
      );
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
