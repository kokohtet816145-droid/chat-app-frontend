import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDkaa-a8xD0-mCT_gnszSHmTf_ZSmLzQ3k",
  authDomain: "mychatapp-c336c.firebaseapp.com",
  projectId: "mychatapp-c336c",
  storageBucket: "mychatapp-c336c.appspot.com",
  messagingSenderId: "1074018185814",
  appId: "1:1074018185814:web:82a06e8f53494c2d6301f7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
