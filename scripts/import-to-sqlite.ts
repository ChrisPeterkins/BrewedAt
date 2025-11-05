import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { eventsDb, podcastDb, rafflesDb, raffleEntriesDb, contactDb, configDb } from '../api/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportDir = path.join(__dirname, '../firebase-export');

interface FirebaseEvent {
  id: string;
  name?: string;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  address?: string;
  location?: string;
  imageUrl?: string;
  ticketUrl?: string;
  websiteUrl?: string;
  eventType?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface FirebasePodcast {
  id: string;
  title?: string;
  description?: string;
  publishDate?: string;
  duration?: string;
  audioUrl?: string;
  imageUrl?: string;
  spotifyUrl?: string;
  appleUrl?: string;
  youtubeUrl?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

function transformEvent(firebaseEvent: FirebaseEvent) {
  const now = new Date().toISOString();

  return {
    id: firebaseEvent.id,
    title: firebaseEvent.name || 'Untitled Event',
    description: firebaseEvent.description || null,
    date: firebaseEvent.eventDate ? new Date(firebaseEvent.eventDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: firebaseEvent.eventTime || null,
    location: firebaseEvent.address || firebaseEvent.location || null,
    brewery: firebaseEvent.location || null,
    breweryLogo: null,
    eventType: firebaseEvent.eventType || 'local',
    imageUrl: firebaseEvent.imageUrl || null,
    externalUrl: firebaseEvent.ticketUrl || firebaseEvent.websiteUrl || null,
    featured: firebaseEvent.featured ? 1 : 0,
    createdAt: firebaseEvent.createdAt || now,
    updatedAt: firebaseEvent.updatedAt || now
  };
}

function transformPodcast(firebasePodcast: FirebasePodcast) {
  const now = new Date().toISOString();

  return {
    id: firebasePodcast.id,
    title: firebasePodcast.title || 'Untitled Episode',
    description: firebasePodcast.description || null,
    publishDate: firebasePodcast.publishDate
      ? new Date(firebasePodcast.publishDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    duration: firebasePodcast.duration || null,
    audioUrl: firebasePodcast.audioUrl || null,
    imageUrl: firebasePodcast.imageUrl || null,
    spotifyUrl: firebasePodcast.spotifyUrl || null,
    appleUrl: firebasePodcast.appleUrl || null,
    youtubeUrl: firebasePodcast.youtubeUrl || null,
    featured: firebasePodcast.featured ? 1 : 0,
    createdAt: firebasePodcast.createdAt || now,
    updatedAt: firebasePodcast.updatedAt || now
  };
}

async function importCollection<T>(
  filename: string,
  collectionName: string,
  transformFn: (item: any) => any,
  insertFn: (item: any) => any
) {
  console.log(`\n📦 Importing collection: ${collectionName}`);

  const filePath = path.join(exportDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${filename}`);
    return { imported: 0, skipped: 0, errors: 0 };
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as T[];

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const item of data) {
      try {
        const transformed = transformFn(item);

        // Skip if essential fields are missing
        if (!transformed.id) {
          console.log(`   ⚠️  Skipping item with missing ID`);
          skipped++;
          continue;
        }

        insertFn(transformed);
        imported++;
      } catch (error: any) {
        console.error(`   ❌ Error importing item:`, error.message);
        errors++;
      }
    }

    console.log(`   ✅ Imported ${imported} items (${skipped} skipped, ${errors} errors)`);

    return { imported, skipped, errors };
  } catch (error: any) {
    console.error(`   ❌ Error reading file:`, error.message);
    return { imported: 0, skipped: 0, errors: 1 };
  }
}

async function importAllData() {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   SQLite Data Import Script          ║');
  console.log('╚══════════════════════════════════════╝');

  console.log(`\n📁 Import directory: ${exportDir}`);

  const results: any = {
    events: { imported: 0, skipped: 0, errors: 0 },
    podcast: { imported: 0, skipped: 0, errors: 0 }
  };

  // Import Events
  results.events = await importCollection<FirebaseEvent>(
    'events.json',
    'events',
    transformEvent,
    (event) => {
      try {
        eventsDb.create(event);
      } catch (error: any) {
        // If it already exists, try to update instead
        if (error.message?.includes('UNIQUE constraint')) {
          console.log(`   ℹ️  Event ${event.id} already exists, updating...`);
          eventsDb.update(event.id, event);
        } else {
          throw error;
        }
      }
    }
  );

  // Import Podcast Episodes
  results.podcast = await importCollection<FirebasePodcast>(
    'podcastEpisodes.json',
    'podcast',
    transformPodcast,
    (episode) => {
      try {
        podcastDb.create(episode);
      } catch (error: any) {
        // If it already exists, try to update instead
        if (error.message?.includes('UNIQUE constraint')) {
          console.log(`   ℹ️  Episode ${episode.id} already exists, updating...`);
          podcastDb.update(episode.id, episode);
        } else {
          throw error;
        }
      }
    }
  );

  // Summary
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   Import Summary                     ║');
  console.log('╠══════════════════════════════════════╣');

  const totalImported = Object.values(results).reduce((sum: number, r: any) => sum + r.imported, 0);
  const totalSkipped = Object.values(results).reduce((sum: number, r: any) => sum + r.skipped, 0);
  const totalErrors = Object.values(results).reduce((sum: number, r: any) => sum + r.errors, 0);

  console.log(`║   Total Imported: ${totalImported.toString().padEnd(18)}║`);
  console.log(`║   Total Skipped: ${totalSkipped.toString().padEnd(19)}║`);
  console.log(`║   Total Errors: ${totalErrors.toString().padEnd(20)}║`);
  console.log('╚══════════════════════════════════════╝\n');

  console.log('📊 Collection Details:');
  Object.entries(results).forEach(([collection, stats]: [string, any]) => {
    console.log(`   ${collection}:`);
    console.log(`     ✅ Imported: ${stats.imported}`);
    console.log(`     ⚠️  Skipped: ${stats.skipped}`);
    console.log(`     ❌ Errors: ${stats.errors}`);
  });

  console.log('\n✨ Import complete!\n');

  process.exit(0);
}

// Run import
importAllData().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
