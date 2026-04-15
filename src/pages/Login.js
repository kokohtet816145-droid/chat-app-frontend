import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        navigate('/chats');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert('အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ။');
        navigate('/chats');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert('အကောင့်သစ် ဖန်တီးပြီးပါပြီ။');
        navigate('/chats');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="anime-girl-placeholder">
          <img
            src="https://i.pinimg.com/originals/3f/7b/5c/3f7b5c9c9c9c9c9c9c9c9c9c9c9c9c9c.gif"
            alt="Anime Girl"
            className="anime-girl"
          />
        </div>
        <h2>{isLogin ? 'Chat App Login' : 'အကောင့်သစ်ဖွင့်ရန်'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? 'ဝင်ရောက်မည်' : 'မှတ်ပုံတင်မည်'}</button>
        </form>
        <p
          style={{ marginTop: '15px', cursor: 'pointer', color: '#764ba2' }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? 'အကောင့်မရှိသေးပါက ဖွင့်ရန်'
            : 'အကောင့်ရှိပြီးသားလား? ဝင်ရောက်ရန်'}
        </p>
      </div>
    </div>
  );
}

export default Login;
