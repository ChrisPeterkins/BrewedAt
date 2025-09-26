const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

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
const db = getFirestore(app);

async function makeUserAdmin() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Error: Please provide a user ID');
    console.log('Usage: node scripts/makeUserAdmin.js <user-id>');
    process.exit(1);
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isAdmin: true
    });

    console.log('✅ Successfully granted admin access to user:', userId);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error granting admin access:', error.message);
    process.exit(1);
  }
}

makeUserAdmin();