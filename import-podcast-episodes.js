const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin
const serviceAccount = require('./brewedat-firebase-adminsdk-fbsvc-f6feca5395.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// YouTube Data API Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';
const CHANNEL_ID = 'UCCYw7P_TKld5pLs14U7_VNQ'; // The BrewedAt Podcast channel ID

async function fetchYouTubeVideos() {
  const videos = [];
  let pageToken = '';

  do {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50&type=video${pageToken ? `&pageToken=${pageToken}` : ''}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API Error:', data.error.message);
      throw new Error(data.error.message);
    }

    videos.push(...data.items);
    pageToken = data.nextPageToken;

    console.log(`Fetched ${videos.length} videos so far...`);
  } while (pageToken);

  return videos;
}

async function extractEpisodeNumber(title) {
  // Try to extract episode number from title (e.g., "#60", "Episode 60", "Ep 60")
  const match = title.match(/#?(\d+)/);
  return match ? parseInt(match[1]) : null;
}

async function importEpisodesToFirestore(videos) {
  console.log(`\nImporting ${videos.length} episodes to Firestore...`);

  let imported = 0;
  let skipped = 0;

  for (const video of videos) {
    const { snippet, id } = video;
    const episodeNumber = await extractEpisodeNumber(snippet.title);

    if (!episodeNumber) {
      console.log(`⚠️  Skipping: "${snippet.title}" (no episode number found)`);
      skipped++;
      continue;
    }

    const episodeData = {
      episodeNumber,
      title: snippet.title,
      description: snippet.description,
      publishDate: admin.firestore.Timestamp.fromDate(new Date(snippet.publishedAt)),
      youtubeUrl: `https://www.youtube.com/watch?v=${id.videoId}`,
      thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
      featured: false,
      // Extract guest name from title if format is consistent
      guestName: extractGuestName(snippet.title),
      // You can manually add these later in admin panel
      spotifyUrl: '',
      appleUrl: '',
      duration: '',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    try {
      await db.collection('podcastEpisodes').add(episodeData);
      console.log(`✅ Imported Episode ${episodeNumber}: ${snippet.title}`);
      imported++;
    } catch (error) {
      console.error(`❌ Error importing episode ${episodeNumber}:`, error.message);
    }
  }

  console.log(`\n✨ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${videos.length}`);
}

function extractGuestName(title) {
  // Try to extract guest name from common formats
  // Example: "#60 - BGS Beverage Consultants (John Stemler)"
  const match = title.match(/[-–—]\s*([^(]+)(?:\(([^)]+)\))?/);
  if (match) {
    const guestInfo = match[1].trim();
    const personName = match[2]?.trim();
    return personName || guestInfo;
  }
  return '';
}

async function main() {
  try {
    console.log('🎙️  BrewedAt Podcast Episode Importer\n');

    if (YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
      console.error('❌ Error: Please set your YouTube API key');
      console.log('\n📝 To get a YouTube API key:');
      console.log('   1. Go to https://console.cloud.google.com/');
      console.log('   2. Create a new project or select existing');
      console.log('   3. Enable "YouTube Data API v3"');
      console.log('   4. Go to Credentials and create an API key');
      console.log('   5. Run: export YOUTUBE_API_KEY="your-key-here"');
      console.log('   6. Then run this script again\n');
      process.exit(1);
    }

    console.log('📺 Fetching videos from YouTube...\n');
    const videos = await fetchYouTubeVideos();

    console.log(`\n✅ Found ${videos.length} videos\n`);

    // Sort by episode number (newest first)
    videos.sort((a, b) => {
      const numA = extractEpisodeNumber(a.snippet.title);
      const numB = extractEpisodeNumber(b.snippet.title);
      return (numB || 0) - (numA || 0);
    });

    await importEpisodesToFirestore(videos);

    console.log('\n🎉 All done! Check your admin panel to verify episodes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
