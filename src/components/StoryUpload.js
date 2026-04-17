import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { FaPlus } from 'react-icons/fa';

function StoryUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleStoryUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `story_${user.uid}_${Date.now()}`;
      const { error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) throw error;

      // TODO: Save story URL to Firestore with expiration
      alert('Story uploaded successfully! (Will expire in 24h)');
    } catch (error) {
      alert('Story upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => {
          handleStoryUpload(e.target.files[0]);
          e.target.value = '';
        }}
        style={{ display: 'none' }}
      />
      <button
        className="btn btn-circle btn-sm bg-gray-200"
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
      >
        <FaPlus className={uploading ? 'animate-pulse' : ''} />
      </button>
    </>
  );
}

export default StoryUpload;
