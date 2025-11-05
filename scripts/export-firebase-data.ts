import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// Note: This will look for GOOGLE_APPLICATION_CREDENTIALS environment variable
// or use the default service account if running on Google Cloud
let serviceAccount: any;
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'brewedat.firebasestorage.app'
  });
  console.log('✅ Firebase Admin initialized with service account');
} else {
  // Try to initialize with default credentials
  try {
    admin.initializeApp({
      projectId: 'brewedat',
      storageBucket: 'brewedat.firebasestorage.app'
    });
    console.log('✅ Firebase Admin initialized with default credentials');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin');
    console.error('Please provide a service account JSON file at:', serviceAccountPath);
    console.error('Or set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    process.exit(1);
  }
}

const db = admin.firestore();
const storage = admin.storage().bucket();

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
    const snapshot = await db.collection(collectionName).get();
    const documents: any[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      // Convert Firestore Timestamps to ISO strings
      const convertedData: any = { id: doc.id };

      for (const [key, value] of Object.entries(data)) {
        if (value && typeof value === 'object' && 'toDate' in value) {
          // Firestore Timestamp
          convertedData[key] = value.toDate().toISOString();
        } else if (value && typeof value === 'object' && 'seconds' in value) {
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

    return documents.length;
  } catch (error: any) {
    console.error(`   ❌ Error exporting ${collectionName}:`, error.message);
    return 0;
  }
}

async function listStorageFiles(prefix: string) {
  console.log(`\n📸 Listing files in Storage: ${prefix}`);

  try {
    const [files] = await storage.getFiles({ prefix });

    const fileList = files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      publicUrl: `https://storage.googleapis.com/${storage.name}/${file.name}`
    }));

    const outputPath = path.join(exportDir, `storage-${prefix.replace(/\//g, '-')}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(fileList, null, 2));

    console.log(`   ✅ Listed ${fileList.length} files`);

    return fileList.length;
  } catch (error: any) {
    console.error(`   ❌ Error listing storage files:`, error.message);
    return 0;
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
  let totalDocuments = 0;
  for (const collection of collections) {
    const count = await exportCollection(collection);
    totalDocuments += count;
  }

  // List Storage files
  console.log('\n📸 Scanning Firebase Storage...');
  let totalFiles = 0;

  const storagePrefixes = ['events/', 'podcast/', 'raffles/'];
  for (const prefix of storagePrefixes) {
    const count = await listStorageFiles(prefix);
    totalFiles += count;
  }

  // Summary
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   Export Summary                     ║');
  console.log('╠══════════════════════════════════════╣');
  console.log(`║   Total Documents: ${totalDocuments.toString().padEnd(18)}║`);
  console.log(`║   Total Files: ${totalFiles.toString().padEnd(22)}║`);
  console.log(`║   Export Location: ${exportDir.split('/').pop()?.padEnd(16)}║`);
  console.log('╚══════════════════════════════════════╝\n');

  console.log('✨ Export complete!\n');

  process.exit(0);
}

// Run export
exportFirebaseData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
