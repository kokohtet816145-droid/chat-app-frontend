import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useSocket } from '../lib/SocketContext';
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

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    alert('Image upload feature coming soon!');
    // TODO: Add Supabase image upload
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`chat ${msg.sender._id === user.uid ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}
        {typing && (
          <div className="chat chat-start">
            <div className="chat-bubble italic text-gray-500">Typing...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="bg-white p-4 flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          className="btn btn-ghost btn-circle"
          onClick={handleImageClick}
        >
          <FaImage />
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
          placeholder="Type a message..."
        />
        <button type="submit" className="btn btn-primary btn-circle">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
