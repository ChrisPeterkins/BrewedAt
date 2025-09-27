const admin = require('firebase-admin');

const serviceAccount = require('../brewedat-firebase-adminsdk-fbsvc-f6feca5395.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function clearData() {
  console.log('\n=== CLEARING NON-ADMIN DATA ===\n');

  const adminUsers = [];
  const usersSnapshot = await db.collection('users').get();

  console.log('Finding admin users...');
  usersSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.isAdmin === true) {
      adminUsers.push(doc.id);
      console.log(`  Preserving admin: ${data.name || data.displayName || doc.id}`);
    }
  });

  // Delete non-admin users
  console.log('\nDeleting non-admin users...');
  let deletedUsers = 0;
  for (const doc of usersSnapshot.docs) {
    if (!adminUsers.includes(doc.id)) {
      await db.collection('users').doc(doc.id).delete();
      deletedUsers++;
    }
  }
  console.log(`  Deleted ${deletedUsers} users`);

  // Clear check-ins
  console.log('\nDeleting check-ins...');
  const checkinsSnapshot = await db.collection('checkins').get();
  const checkinsBatch = db.batch();
  checkinsSnapshot.docs.forEach(doc => {
    checkinsBatch.delete(doc.ref);
  });
  await checkinsBatch.commit();
  console.log(`  Deleted ${checkinsSnapshot.docs.length} check-ins`);

  // Clear raffle entries
  console.log('\nDeleting raffle entries...');
  const entriesSnapshot = await db.collection('raffleEntries').get();
  const entriesBatch = db.batch();
  entriesSnapshot.docs.forEach(doc => {
    entriesBatch.delete(doc.ref);
  });
  await entriesBatch.commit();
  console.log(`  Deleted ${entriesSnapshot.docs.length} raffle entries`);

  // Delete raffles
  console.log('\nDeleting raffles...');
  const rafflesSnapshot = await db.collection('raffles').get();
  const rafflesBatch = db.batch();
  rafflesSnapshot.docs.forEach(doc => {
    rafflesBatch.delete(doc.ref);
  });
  await rafflesBatch.commit();
  console.log(`  Deleted ${rafflesSnapshot.docs.length} raffles`);

  // Reset admin user stats (but keep them as admin)
  console.log('\nResetting admin user stats...');
  for (const adminId of adminUsers) {
    await db.collection('users').doc(adminId).update({
      totalPoints: 0,
      level: 1,
      achievements: []
    });
  }
  console.log(`  Reset ${adminUsers.length} admin users`);

  console.log('\n✅ Data cleared! Admin accounts preserved.\n');
  process.exit(0);
}

clearData().catch(console.error);