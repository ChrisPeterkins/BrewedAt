import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCJTDteoLsgqUevqV_1WHg3XdjOTAaJu4o",
  authDomain: "brewedat.firebaseapp.com",
  projectId: "brewedat",
  storageBucket: "brewedat.firebasestorage.app",
  messagingSenderId: "264641983823",
  appId: "1:264641983823:web:27782317ef0dd8bf5f813a",
  measurementId: "G-81P591DG9M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
