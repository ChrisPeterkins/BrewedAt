import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
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
const db = getFirestore(app);
const storage = getStorage(app);

// Collections to export
const collections = [
  'events',
  'podcastEpisodes',
  'raffles',
  'raffleEntries',
  'contactSubmissions',
  'siteConfig',
  'users',
  'checkins'
];

// Output directory
const exportDir = path.join(__dirname, '../firebase-export');

async function exportCollection(collectionName: string) {
  console.log(`\n📦 Exporting collection: ${collectionName}`);

  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const documents: any[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      // Convert Firestore Timestamps to ISO strings
      const convertedData: any = { id: doc.id };

      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
          // Firestore Timestamp
          convertedData[key] = value.toDate().toISOString();
        } else if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
          // Firestore Timestamp object format
          convertedData[key] = new Date(value.seconds * 1000).toISOString();
        } else {
          convertedData[key] = value;
        }
      }

      documents.push(convertedData);
    });

    // Save to JSON file
    const outputPath = path.join(exportDir, `${collectionName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(documents, null, 2));

    console.log(`   ✅ Exported ${documents.length} documents to ${collectionName}.json`);

    return { collection: collectionName, count: documents.length, documents };
  } catch (error: any) {
    console.error(`   ❌ Error exporting ${collectionName}:`, error.message);
    return { collection: collectionName, count: 0, documents: [], error: error.message };
  }
}

async function listStorageFiles(prefix: string) {
  console.log(`\n📸 Listing files in Storage: ${prefix}`);

  try {
    const storageRef = ref(storage, prefix);
    const result = await listAll(storageRef);

    const fileList = await Promise.all(
      result.items.map(async (itemRef) => {
        try {
          const url = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadUrl: url
          };
        } catch (error) {
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            error: 'Failed to get download URL'
          };
        }
      })
    );

    const outputPath = path.join(exportDir, `storage-${prefix.replace(/\//g, '-')}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(fileList, null, 2));

    console.log(`   ✅ Listed ${fileList.length} files`);

    return { prefix, count: fileList.length, files: fileList };
  } catch (error: any) {
    console.error(`   ❌ Error listing storage files (${prefix}):`, error.message);
    return { prefix, count: 0, files: [], error: error.message };
  }
}

async function exportFirebaseData() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   Firebase Data Export Script        ║');
  console.log('╚══════════════════════════════════════╝');

  // Create export directory
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  console.log(`\n📁 Export directory: ${exportDir}`);

  // Export all collections
  const collectionResults = [];
  let totalDocuments = 0;

  for (const collectionName of collections) {
    const result = await exportCollection(collectionName);
    collectionResults.push(result);
    totalDocuments += result.count;
  }

  // List Storage files
  console.log('\n📸 Scanning Firebase Storage...');
  const storageResults = [];
  let totalFiles = 0;

  const storagePrefixes = ['events/', 'podcast/', 'raffles/'];
  for (const prefix of storagePrefixes) {
    const result = await listStorageFiles(prefix);
    storageResults.push(result);
    totalFiles += result.count;
  }

  // Save export summary
  const summary = {
    exportDate: new Date().toISOString(),
    collections: collectionResults,
    storage: storageResults,
    totals: {
      documents: totalDocuments,
      files: totalFiles
    }
  };

  fs.writeFileSync(
    path.join(exportDir, 'export-summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // Display summary
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   Export Summary                     ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║   Total Documents: ${totalDocuments.toString().padEnd(18)}║`);
  console.log(`║   Total Files: ${totalFiles.toString().padEnd(22)}║`);
  console.log('╚══════════════════════════════════════╝\n');

  // Show collection details
  console.log('📊 Collection Details:');
  collectionResults.forEach(result => {
    const status = result.error ? '❌' : '✅';
    console.log(`   ${status} ${result.collection}: ${result.count} documents`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });

  console.log('\n📁 Storage Details:');
  storageResults.forEach(result => {
    const status = result.error ? '❌' : '✅';
    console.log(`   ${status} ${result.prefix}: ${result.count} files`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });

  console.log('\n✨ Export complete!\n');

  process.exit(0);
}

// Run export
exportFirebaseData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
