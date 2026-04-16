import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useSocket } from '../lib/SocketContext';
import { supabase } from '../lib/supabaseClient';
import { FaPaperPlane, FaMicrophone, FaImage, FaArrowLeft } from 'react-icons/fa';

function ChatBox() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const isOnline = onlineUsers.some(u => u.userId === chatId);

  useEffect(() => {
    if (socket) {
      socket.emit('join chat', chatId);
      socket.on('message received', (msg) => {
        setMessages(prev => [...prev, msg]);
      });
      socket.on('typing', () => setTyping(true));
      socket.on('stop typing', () => setTyping(false));
    }
    return () => {
      if (socket) {
        socket.off('message received');
        socket.off('typing');
        socket.off('stop typing');
      }
    };
  }, [socket, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = {
      sender: { _id: user.uid, username: user.email },
      content: newMessage,
      chat: { _id: chatId, users: [{ _id: chatId }] },
      messageType: 'text',
    };
    socket.emit('new message', msg);
    setMessages(prev => [...prev, { ...msg, sender: { ...msg.sender, _id: user.uid } }]);
    setNewMessage('');
    socket.emit('stop typing', chatId);
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) {
      socket.emit('typing', chatId);
      setIsTyping(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop typing', chatId);
      setIsTyping(false);
    }, 1000);
  };

  const handleVoiceRecord = () => {
    alert('Voice message feature coming soon!');
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) {
        console.error('Supabase upload error:', error);
        alert('Upload Error: ' + error.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(data.path);
      const publicUrl = urlData.publicUrl;

      const msg = {
        sender: { _id: user.uid, username: user.email },
        content: '',
        chat: { _id: chatId, users: [{ _id: chatId }] },
        messageType: 'image',
        fileUrl: publicUrl,
      };
      socket.emit('new message', msg);
      setMessages(prev => [...prev, { ...msg, sender: { ...msg.sender, _id: user.uid } }]);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Unexpected Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
    e.target.value = '';
  };

  const renderMessageContent = (msg) => {
    if (msg.messageType === 'image') {
      return <img src={msg.fileUrl} alt="Shared content" className="max-w-xs rounded-lg" />;
    }
    return msg.content;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white p-4 shadow flex items-center gap-3">
        <button className="btn btn-ghost btn-circle md:hidden" onClick={() => navigate('/chats')}>
          <FaArrowLeft />
        </button>
        <div className="avatar placeholder">
          <div className="bg-neutral text-neutral-content rounded-full w-10">
            <span>U</span>
          </div>
        </div>
        <div>
          <h3 className="font-bold">User {chatId}</h3>
          <p className="text-sm text-gray-500">
            {isOnline ? (
              <span className="text-green-500">● Online</span>
            ) : (
              <span className="text-gray-400">○ Offline</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`chat ${msg.sender._id === user.uid ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-bubble p-2">
              {renderMessageContent(msg)}
            </div>
          </div>
        ))}
        {typing && (
          <div className="chat chat-start">
            <div className="chat-bubble italic text-gray-500">Typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-white p-4 flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="btn btn-ghost btn-circle"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          <FaImage className={uploading ? 'animate-pulse' : ''} />
        </button>
        <button
          type="button"
          className={`btn btn-ghost btn-circle ${isRecording ? 'text-red-500' : ''}`}
          onTouchStart={() => setIsRecording(true)}
          onTouchEnd={() => {
            setIsRecording(false);
            handleVoiceRecord();
          }}
          onMouseDown={() => setIsRecording(true)}
          onMouseUp={() => {
            setIsRecording(false);
            handleVoiceRecord();
          }}
        >
          <FaMicrophone />
        </button>
        <input
          type="text"
          className="input input-bordered flex-1"
          value={newMessage}
          onChange={handleTyping}
          placeholder={uploading ? "ပုံတင်နေသည်..." : "စာရိုက်ပါ..."}
          disabled={uploading}
        />
        <button type="submit" className="btn btn-primary btn-circle" disabled={uploading}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
