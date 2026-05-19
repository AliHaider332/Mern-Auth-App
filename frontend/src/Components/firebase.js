import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBstymhSVh76wkfrTHOB9dkfdW1HJs612M',
  authDomain: 'lively-obelisk-396216.firebaseapp.com',
  projectId: 'lively-obelisk-396216',
  storageBucket: 'lively-obelisk-396216.firebasestorage.app',
  messagingSenderId: '859935840605',
  appId: '1:859935840605:web:1b1c8d6f155a3401b430b4',
  measurementId: 'G-RQ4F6KELNS',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
