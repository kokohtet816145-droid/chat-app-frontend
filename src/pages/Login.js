import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/chats');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          username: email.split('@')[0],
          isAdmin: false,
          createdAt: new Date().toISOString(),
          profilePic: "",
          bio: ""
        });
        
        alert('အကောင့်သစ် ဖန်တီးပြီးပါပြီ။ ဆက်လက်၍ Login ဝင်ပါ။');
        setIsLogin(true);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card w-96 bg-white shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{isLogin ? 'Login' : 'Register'}</h2>
          <input 
            type="email" 
            placeholder="Email" 
            className="input input-bordered" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="input input-bordered" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            className={`btn btn-primary ${loading ? 'loading' : ''}`} 
            onClick={handleSubmit}
            disabled={loading}
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
          <p 
            className="text-center text-sm text-blue-500 cursor-pointer mt-2"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'အကောင့်မရှိသေးပါက ဖွင့်ရန်' : 'အကောင့်ရှိပြီးသားလား? ဝင်ရောက်ရန်'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
