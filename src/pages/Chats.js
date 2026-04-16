import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Chats() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        setError(error.message);
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error loading users:</p>
          <p className="text-sm">{error}</p>
          <button className="btn btn-sm mt-4" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Chats</h2>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 p-4">No users found. Please register another account.</p>
          ) : (
            users.map(u => (
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
                <div>
                  <p className="font-semibold">{u.username}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="hidden md:flex md:w-2/3 lg:w-3/4 items-center justify-center bg-gray-50">
        <p className="text-gray-400">Select a user to start chatting</p>
      </div>
    </div>
  );
}

export default Chats;
