import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || '');
          setBio(data.bio || '');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { username, bio });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button className="btn btn-ghost btn-circle" onClick={() => navigate('/chats')}>
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        <div className="card bg-white shadow-xl">
          <div className="card-body">
            <div className="form-control">
              <label className="label">Email</label>
              <input type="email" className="input input-bordered" value={user?.email || ''} disabled />
            </div>
            <div className="form-control">
              <label className="label">Username</label>
              <input
                type="text"
                className="input input-bordered"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">Bio</label>
              <textarea
                className="textarea textarea-bordered"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <button
              className={`btn btn-primary mt-4 ${saving ? 'loading' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave className="mr-2" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
