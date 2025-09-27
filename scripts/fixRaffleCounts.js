const admin = require('firebase-admin');

const serviceAccount = require('../brewedat-firebase-adminsdk-fbsvc-f6feca5395.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixRaffleCounts() {
  console.log('\n=== FIXING RAFFLE COUNTS ===\n');

  const rafflesSnapshot = await db.collection('raffles').get();

  for (const raffleDoc of rafflesSnapshot.docs) {
    const entriesSnapshot = await db.collection('raffleEntries')
      .where('raffleId', '==', raffleDoc.id)
      .get();

    const totalEntries = entriesSnapshot.docs.reduce((sum, doc) => {
      return sum + doc.data().entriesCount;
    }, 0);

    await db.collection('raffles').doc(raffleDoc.id).update({
      totalEntries: totalEntries
    });

    console.log(`Updated ${raffleDoc.data().prizeName}: ${totalEntries} entries`);
  }

  console.log('\n✅ All raffle counts fixed!\n');
  process.exit(0);
}

fixRaffleCounts().catch(console.error);