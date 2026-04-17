import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { supabase } from '../lib/supabaseClient';
import { FaArrowLeft, FaSave, FaUserCircle, FaCamera } from 'react-icons/fa';

function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
          setProfilePic(data.profilePic || '');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfilePicUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `profile_${user.uid}_${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(data.path);
      
      const publicUrl = urlData.publicUrl;
      setProfilePic(publicUrl);
      
      // Auto-save to Firestore
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { profilePic: publicUrl });
      alert('Profile picture updated!');
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button className="btn btn-ghost btn-circle text-white" onClick={() => navigate('/chats')}>
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>

        <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-lg bg-white/20 flex items-center justify-center">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUserCircle className="text-white text-6xl" />
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary"
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
              >
                <FaCamera />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => {
                  handleProfilePicUpload(e.target.files[0]);
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          {uploading && <p className="text-center text-white/70 text-sm mb-4">Uploading...</p>}

          <div className="space-y-4">
            <div>
              <label className="label text-white/70">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={user?.email || ''}
                disabled
              />
            </div>
            <div>
              <label className="label text-white/70">Username</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="label text-white/70">Bio</label>
              <textarea
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                rows="3"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>
            <button
              className={`w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition duration-200 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              <FaSave className="inline mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
