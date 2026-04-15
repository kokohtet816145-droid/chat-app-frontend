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

  const isUserOnline = (userId) => onlineUsers.some(u => u.userId === userId);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Chats</h2>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-circle">
              <FaSearch />
            </button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle">
                <FaBars />
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li><button className="w-full text-left px-4 py-2 hover:bg-gray-100">Profile</button></li>
                <li><button className="w-full text-left px-4 py-2 hover:bg-gray-100">Settings</button></li>
                <li><button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Logout <FaSignOutAlt className="ml-2 inline" /></button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-2 border-b flex gap-2 overflow-x-auto">
          <button className="btn btn-circle btn-sm bg-gray-200">
            <FaPlus />
          </button>
          {users.filter(u => isUserOnline(u._id)).map(u => (
            <div key={u._id} className="avatar placeholder">
              <div className="bg-green-500 text-white rounded-full w-10">
                <span>{u.username?.charAt(0)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-2">
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredUsers.map(u => (
            <div
              key={u._id}
              className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b"
              onClick={() => navigate(`/chat/${u._id}`)}
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
                <p className="text-sm text-gray-500 truncate">
                  {isUserOnline(u._id) ? (
                    <span className="text-green-500">● Online</span>
                  ) : (
                    <span className="text-gray-400">○ Offline</span>
                  )} • Last message...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:flex md:w-2/3 lg:w-3/4 items-center justify-center bg-gray-50">
        <p className="text-gray-400">Select a chat to start messaging</p>
      </div>
    </div>
  );
};

export default Chats;
