import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { FaArrowLeft, FaCrown, FaUserShield, FaSearch } from 'react-icons/fa';

function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const list = [];
        snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setUsers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleBlock = async (userId, current) => {
    try {
      await updateDoc(doc(db, "users", userId), { blocked: !current });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !current } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleAdmin = async (userId, current) => {
    try {
      await updateDoc(doc(db, "users", userId), { isAdmin: !current });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isAdmin: !current } : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex h-screen items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button className="btn btn-ghost btn-circle" onClick={() => navigate('/chats')}><FaArrowLeft /></button>
          <h1 className="text-2xl font-bold flex items-center gap-2">Admin Panel <FaUserShield className="text-primary" /></h1>
        </div>
        <div className="mb-4 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search users..." className="input input-bordered w-full pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table w-full">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar placeholder"><div className="bg-neutral text-neutral-content rounded-full w-8"><span>{u.username?.charAt(0)}</span></div></div>
                      <span className="font-semibold">{u.username}</span>
                      {u.isAdmin && <div className="badge badge-warning gap-1 animate-pulse"><FaCrown className="text-yellow-500" />Admin</div>}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    {u.id !== user?.uid ? (
                      <button className={`btn btn-xs ${u.isAdmin ? 'btn-error' : 'btn-success'}`} onClick={() => handleToggleAdmin(u.id, u.isAdmin)}>
                        {u.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    ) : <span className="text-gray-400 text-sm">You</span>}
                  </td>
                  <td><span className={`badge ${u.blocked ? 'badge-error' : 'badge-success'}`}>{u.blocked ? 'Blocked' : 'Active'}</span></td>
                  <td>
                    {u.id !== user?.uid && (
                      <button className={`btn btn-sm ${u.blocked ? 'btn-success' : 'btn-error'}`} onClick={() => handleBlock(u.id, u.blocked)}>
                        {u.blocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
