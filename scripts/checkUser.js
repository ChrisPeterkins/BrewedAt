const admin = require('firebase-admin');

const serviceAccount = require('../brewedat-firebase-adminsdk-fbsvc-f6feca5395.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUser() {
  const userId = process.argv[2];

  if (!userId) {
    console.log('Usage: node checkUser.js <userId>');
    console.log('\nOr check all users:');
    const usersSnapshot = await db.collection('users').get();
    console.log('\nAll users:');
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.displayName || 'NO DISPLAY NAME'} (${data.email || 'no email'})`);
    });
    process.exit(0);
  }

  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    console.log('User not found');
    process.exit(1);
  }

  console.log('\nUser data:');
  console.log(JSON.stringify(userDoc.data(), null, 2));
  process.exit(0);
}

checkUser().catch(console.error);