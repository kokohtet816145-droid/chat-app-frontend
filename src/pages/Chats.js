import React, { useState, useEffect } from 'react';
import { useSocket } from '../lib/SocketContext';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlus, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

const Chats = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== user?.uid) {
            usersList.push({ _id: doc.id, ...doc.data() });
          }
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  // ... ကျန်တဲ့ Code (isUserOnline, handleLogout, filteredUsers, UI)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    // ... မူလ UI
  );
};

export default Chats;
