const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./brewedat-firebase-adminsdk-fbsvc-f6feca5395.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteAllEpisodes() {
  try {
    console.log('🗑️  Deleting all existing podcast episodes...\n');

    const episodesRef = db.collection('podcastEpisodes');
    const snapshot = await episodesRef.get();

    if (snapshot.empty) {
      console.log('✅ No episodes found. Collection is already empty.\n');
      process.exit(0);
    }

    console.log(`Found ${snapshot.size} episodes to delete...\n`);

    const batchSize = 500;
    let deletedCount = 0;

    // Delete in batches
    while (true) {
      const snapshot = await episodesRef.limit(batchSize).get();

      if (snapshot.empty) {
        break;
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      deletedCount += snapshot.size;
      console.log(`✅ Deleted ${deletedCount} episodes...`);
    }

    console.log(`\n🎉 Successfully deleted ${deletedCount} episodes!\n`);
    console.log('You can now run the import script to re-import all episodes.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting episodes:', error);
    process.exit(1);
  }
}

deleteAllEpisodes();
