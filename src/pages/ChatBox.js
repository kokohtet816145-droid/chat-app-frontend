import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useSocket } from '../lib/SocketContext';
import { supabase } from '../lib/supabaseClient';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { FaPaperPlane, FaMicrophone, FaImage, FaArrowLeft, FaStop, FaReply, FaTrash } from 'react-icons/fa';

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
  const [replyingTo, setReplyingTo] = useState(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const isOnline = onlineUsers.some(u => u.userId === chatId);

  // Fetch message history from Firestore
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.chatId === chatId) {
          msgs.push({ id: doc.id, ...data });
        }
      });
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (socket) {
      socket.emit('join chat', chatId);
      socket.on('message received', (msg) => {
        addDoc(collection(db, "messages"), {
          chatId: chatId,
          senderId: msg.sender._id,
          content: msg.content || '',
          messageType: msg.messageType || 'text',
          fileUrl: msg.fileUrl || '',
          replyTo: msg.replyTo || null,
          timestamp: serverTimestamp()
        });
      });
      socket.on('message deleted', (messageId) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
      });
      socket.on('typing', () => setTyping(true));
      socket.on('stop typing', () => setTyping(false));
    }
    return () => {
      if (socket) {
        socket.off('message received');
        socket.off('message deleted');
        socket.off('typing');
        socket.off('stop typing');
      }
    };
  }, [socket, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !replyingTo) return;
    const msg = {
      sender: { _id: user.uid, username: user.email },
      content: newMessage,
      chat: { _id: chatId, users: [{ _id: chatId }] },
      messageType: 'text',
      replyTo: replyingTo ? { id: replyingTo.id, content: replyingTo.content, sender: replyingTo.sender } : null,
    };
    socket.emit('new message', msg);
    setMessages(prev => [...prev, { ...msg, sender: { ...msg.sender, _id: user.uid }, timestamp: new Date() }]);
    setNewMessage('');
    setReplyingTo(null);
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

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteDoc(doc(db, "messages", messageId));
      socket.emit('delete message', messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      alert('Delete failed: ' + error.message);
    }
  };

  const handleReply = (msg) => {
    setReplyingTo({ id: msg.id, content: msg.content, sender: msg.sender?.username || msg.senderId });
  };

  // Voice Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      alert('Microphone access denied or not available');
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVoiceMessage = async (audioBlob) => {
    setUploading(true);
    try {
      const fileName = `voice_${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, audioBlob, { contentType: 'audio/webm' });

      if (error) {
        alert('Voice upload error: ' + error.message);
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
        messageType: 'voice',
        fileUrl: publicUrl,
      };
      socket.emit('new message', msg);
      setMessages(prev => [...prev, { ...msg, sender: { ...msg.sender, _id: user.uid }, timestamp: new Date() }]);
    } catch (error) {
      alert('Unexpected Error: ' + error.message);
    } finally {
      setUploading(false);
    }
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
      setMessages(prev => [...prev, { ...msg, sender: { ...msg.sender, _id: user.uid }, timestamp: new Date() }]);
    } catch (error) {
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
    } else if (msg.messageType === 'voice') {
      return (
        <audio controls className="max-w-xs">
          <source src={msg.fileUrl} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      );
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
          <div key={msg.id || i} className={`chat ${msg.senderId === user.uid || msg.sender?._id === user.uid ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-bubble p-2 relative group">
              {msg.replyTo && (
                <div className="text-xs italic bg-gray-200 p-2 rounded mb-1 border-l-4 border-primary">
                  Replying to: {msg.replyTo.content?.substring(0, 30)}...
                </div>
              )}
              {renderMessageContent(msg)}
              <div className="absolute top-0 right-0 hidden group-hover:flex gap-1">
                <button className="btn btn-xs btn-ghost" onClick={() => handleReply(msg)}>
                  <FaReply />
                </button>
                {msg.senderId === user.uid && (
                  <button className="btn btn-xs btn-ghost text-error" onClick={() => handleDeleteMessage(msg.id)}>
                    <FaTrash />
                  </button>
                )}
              </div>
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

      {replyingTo && (
        <div className="bg-gray-200 p-2 flex justify-between items-center">
          <span className="text-sm">Replying to: {replyingTo.content?.substring(0, 40)}...</span>
          <button className="btn btn-xs btn-ghost" onClick={() => setReplyingTo(null)}>Cancel</button>
        </div>
      )}

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
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          disabled={uploading}
        >
          {isRecording ? <FaStop /> : <FaMicrophone />}
        </button>
        <input
          type="text"
          className="input input-bordered flex-1"
          value={newMessage}
          onChange={handleTyping}
          placeholder={uploading ? "ပို့နေသည်..." : "စာရိုက်ပါ..."}
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
