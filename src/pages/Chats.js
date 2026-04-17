import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useSocket } from '../lib/SocketContext';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { FaSearch, FaSignOutAlt, FaUserShield, FaUserCircle } from 'react-icons/fa';

function Chats() {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserData, setCurrentUserData] = useState({});
  const navigate = useNavigate();

  const isUserOnline = (userId) => onlineUsers.some(u => u.userId === userId);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const all = [];
        usersSnap.forEach(doc => { 
          const data = doc.data();
          if (doc.id === user.uid) {
            setCurrentUserData(data);
          } else {
            all.push({ id: doc.id, ...data });
          }
        });
        const msgQuery = query(collection(db, "messages"), where("participants", "array-contains", user.uid));
        const msgSnap = await getDocs(msgQuery);
        const chattedIds = new Set();
        msgSnap.forEach(doc => doc.data().participants?.forEach(id => { if (id !== user.uid) chattedIds.add(id); }));
        const chatted = all.filter(u => chattedIds.has(u.id));
        setUsers(chatted);
        setIsAdmin(currentUserData.isAdmin || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Chats ({users.length})</h2>
          <div className="flex gap-2">
            {isAdmin && <button className="btn btn-ghost btn-circle" onClick={() => navigate('/admin')}><FaUserShield className="text-warning" /></button>}
            <Link to="/profile" className="btn btn-ghost btn-circle">
              {currentUserData.profilePic ? (
                <img src={currentUserData.profilePic} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <FaUserCircle />
              )}
            </Link>
            <button className="btn btn-ghost btn-circle" onClick={handleLogout}><FaSignOutAlt /></button>
          </div>
        </div>
        <div className="p-2 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." className="input input-bordered w-full pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? <p className="text-center text-gray-500 p-4">No conversations</p> :
            filtered.map(u => (
              <div key={u.id} className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b" onClick={() => navigate(`/chat/${u.id}`)}>
                <div className="avatar mr-3">
                  <div className="w-12 h-12 rounded-full bg-neutral text-neutral-content flex items-center justify-center overflow-hidden">
                    {u.profilePic ? (
                      <img src={u.profilePic} alt={u.username} className="w-full h-full object-cover" />
                    ) : (
                      <span>{u.username?.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between"><span className="font-semibold">{u.username}</span>{u.isAdmin && <span className="badge badge-primary badge-sm">Admin</span>}</div>
                  <p className="text-sm text-gray-500">{isUserOnline(u.id) ? <span className="text-green-500">● Online</span> : <span className="text-gray-400">○ Offline</span>}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div className="hidden md:flex md:w-2/3 lg:w-3/4 items-center justify-center bg-gray-50"><p className="text-gray-400">Select a chat</p></div>
    </div>
  );
}

export default Chats;
