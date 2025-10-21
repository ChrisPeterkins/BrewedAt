import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJTDteoLsgqUevqV_1WHg3XdjOTAaJu4o",
  authDomain: "brewedat.firebaseapp.com",
  projectId: "brewedat",
  storageBucket: "brewedat.firebasestorage.app",
  messagingSenderId: "264641983823",
  appId: "1:264641983823:web:27782317ef0dd8bf5f813a",
  measurementId: "G-81P591DG9M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;