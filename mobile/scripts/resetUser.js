const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, collection, query, where, getDocs, deleteDoc } = require('firebase/firestore');

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

async function resetUser() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Error: Please provide a user ID');
    console.log('Usage: node scripts/resetUser.js <user-id>');
    process.exit(1);
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalPoints: 0,
      level: 1,
      achievements: []
    });
    console.log('✅ Reset user points, level, and achievements');

    const checkinsQuery = query(
      collection(db, 'checkins'),
      where('userId', '==', userId)
    );
    const checkinsSnapshot = await getDocs(checkinsQuery);

    const deletePromises = checkinsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log(`✅ Deleted ${checkinsSnapshot.size} check-ins`);
    console.log('✅ User reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting user:', error.message);
    process.exit(1);
  }
}

resetUser();