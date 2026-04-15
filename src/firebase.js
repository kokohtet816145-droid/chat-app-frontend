import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ဒီစာကြောင်းထည့်ပါ

const firebaseConfig = {
  // သင့် Config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // ဒီစာကြောင်းထည့်ပါ
