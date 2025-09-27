const admin = require('firebase-admin');

// Initialize with service account
try {
  const serviceAccount = require('../brewedat-firebase-adminsdk-fbsvc-f6feca5395.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error: Service account key not found.');
  console.error('Please download from Firebase Console → Project Settings → Service Accounts');
  process.exit(1);
}

const db = admin.firestore();

async function checkRaffles() {
  console.log('\n=== CHECKING RAFFLES ===\n');

  const rafflesSnapshot = await db.collection('raffles').get();
  console.log(`Found ${rafflesSnapshot.docs.length} raffles\n`);

  for (const raffleDoc of rafflesSnapshot.docs) {
    const raffle = raffleDoc.data();
    console.log(`Raffle: ${raffle.prizeName}`);
    console.log(`  ID: ${raffleDoc.id}`);
    console.log(`  Status: ${raffle.status}`);
    console.log(`  Total Entries (field): ${raffle.totalEntries || 0}`);
    console.log(`  End Date: ${raffle.endDate?.toDate()}`);

    const entriesSnapshot = await db.collection('raffleEntries')
      .where('raffleId', '==', raffleDoc.id)
      .get();

    console.log(`  Actual Entries in DB: ${entriesSnapshot.docs.length}`);

    if (entriesSnapshot.docs.length > 0) {
      console.log('  \n  Entrants:');
      const entrantsMap = {};
      entriesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (entrantsMap[data.userId]) {
          entrantsMap[data.userId] += data.entriesCount;
        } else {
          entrantsMap[data.userId] = data.entriesCount;
        }
      });

      // Get user names
      const usersSnapshot = await db.collection('users').get();
      const usersMap = {};
      usersSnapshot.docs.forEach(doc => {
        usersMap[doc.id] = doc.data().displayName || 'Anonymous';
      });

      for (const [userId, count] of Object.entries(entrantsMap)) {
        const userName = usersMap[userId] || 'Unknown';
        console.log(`    - ${userName} (${userId}): ${count} entries`);
      }
    } else {
      console.log('    No entries yet');
    }
    console.log('\n');
  }

  process.exit(0);
}

checkRaffles().catch(console.error);