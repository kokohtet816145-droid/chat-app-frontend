import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useSocket } from '../lib/SocketContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FaSignOutAlt, FaUserShield, FaSearch, FaPlus } from 'react-icons/fa';

function Chats() {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const isUserOnline = (userId) => onlineUsers.some(u => u.userId === userId);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== user?.uid) {
            usersList.push({ id: doc.id, ...doc.data() });
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

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const currentUserData = users.find(u => u.id === user?.uid) || { isAdmin: false };
  const isAdmin = currentUserData.isAdmin || false;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Chats</h2>
          <div className="flex gap-2">
            {isAdmin && (
              <button className="btn btn-ghost btn-circle" onClick={() => navigate('/admin')} title="Admin Panel">
                <FaUserShield />
              </button>
            )}
            <button className="btn btn-ghost btn-circle" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {/* Story Bar Placeholder */}
        <div className="p-2 border-b flex gap-2 overflow-x-auto">
          <button className="btn btn-circle btn-sm bg-gray-200">
            <FaPlus />
          </button>
          {users.filter(u => isUserOnline(u.id)).slice(0, 5).map(u => (
            <div key={u.id} className="avatar placeholder">
              <div className="bg-green-500 text-white rounded-full w-10">
                <span>{u.username?.charAt(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-2">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredUsers.filter(u => !u.blocked).map(u => (
            <div
              key={u.id}
              className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b"
              onClick={() => navigate(`/chat/${u.id}`)}
            >
              <div className="avatar placeholder mr-3">
                <div className="bg-neutral text-neutral-content rounded-full w-12">
                  <span>{u.username?.charAt(0)}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-semibold">{u.username}</span>
                  {u.isAdmin && <span className="badge badge-primary badge-sm">Admin</span>}
                </div>
                <p className="text-sm text-gray-500">
                  {isUserOnline(u.id) ? (
                    <span className="text-green-500">● Online</span>
                  ) : (
                    <span className="text-gray-400">○ Offline</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hidden md:flex md:w-2/3 lg:w-3/4 items-center justify-center bg-gray-50">
        <p className="text-gray-400">Select a user to start chatting</p>
      </div>
    </div>
  );
}

export default Chats;
