import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext'; // နောက်မှ ဖန်တီးပါမယ်

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth(); // Firebase User

  useEffect(() => {
    if (user) {
      const newSocket = io('https://chat-app-backend-2-rhx3.onrender.com'); // သင့် Render URL
      setSocket(newSocket);

      newSocket.emit('setup', user.uid);
      newSocket.on('get online users', (users) => setOnlineUsers(users));

      return () => newSocket.disconnect();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
