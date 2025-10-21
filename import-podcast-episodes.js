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
const CHANNEL_ID = 'UCNRWJgn_oy0OWR4oa3JEV2A'; // The BrewedAt Podcast channel ID

async function fetchYouTubeVideos() {
  const videos = [];
  let pageToken = '';

  // First, fetch all video IDs
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

async function getVideoDurations(videoIds) {
  const durations = {};

  // Process in batches of 50 (YouTube API limit)
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&id=${batch.join(',')}&part=contentDetails`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API Error:', data.error.message);
      throw new Error(data.error.message);
    }

    data.items.forEach(item => {
      durations[item.id] = parseDuration(item.contentDetails.duration);
    });
  }

  return durations;
}

function parseDuration(isoDuration) {
  // Parse ISO 8601 duration format (e.g., PT1H23M45S)
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

async function extractEpisodeNumber(title) {
  // Try to extract episode number from title (e.g., "#60", "Episode 60", "Ep 60")
  const match = title.match(/#?(\d+)/);
  return match ? parseInt(match[1]) : null;
}

async function importEpisodesToFirestore(videos) {
  console.log(`\nFetching video durations...`);

  const videoIds = videos.map(v => v.id.videoId);
  const durations = await getVideoDurations(videoIds);

  console.log(`\nImporting ${videos.length} videos to Firestore...\n`);

  let imported = 0;
  let withoutNumber = 0;
  let episodeCount = 0;
  let shortCount = 0;

  for (const video of videos) {
    const { snippet, id } = video;
    const episodeNumber = await extractEpisodeNumber(snippet.title);
    const durationSeconds = durations[id.videoId] || 0;
    const videoType = durationSeconds > 600 ? 'episode' : 'short'; // 600 seconds = 10 minutes

    if (!episodeNumber) {
      withoutNumber++;
    }

    if (videoType === 'episode') {
      episodeCount++;
    } else {
      shortCount++;
    }

    const episodeData = {
      episodeNumber: 0, // Set manually in admin panel
      title: snippet.title, // Use title as-is from YouTube
      description: snippet.description,
      publishDate: admin.firestore.Timestamp.fromDate(new Date(snippet.publishedAt)),
      youtubeUrl: `https://www.youtube.com/watch?v=${id.videoId}`,
      thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
      featured: false,
      videoType: videoType, // 'episode' or 'short'
      durationSeconds: durationSeconds,
      duration: formatDuration(durationSeconds),
      guestName: '', // Add manually in admin panel
      spotifyUrl: '',
      appleUrl: '',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    };

    try {
      await db.collection('podcastEpisodes').add(episodeData);
      const typeLabel = videoType === 'episode' ? '🎙️' : '📹';
      if (episodeNumber) {
        console.log(`✅ ${typeLabel} Episode ${episodeNumber}: ${snippet.title}`);
      } else {
        console.log(`✅ ${typeLabel} (no #): ${snippet.title.substring(0, 60)}...`);
      }
      imported++;
    } catch (error) {
      console.error(`❌ Error importing "${snippet.title}":`, error.message);
    }
  }

  console.log(`\n✨ Import complete!`);
  console.log(`   Total imported: ${imported}`);
  console.log(`   Full episodes (>10 min): ${episodeCount}`);
  console.log(`   Shorts (≤10 min): ${shortCount}`);
  console.log(`   Without episode #: ${withoutNumber}`);
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
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

    // Sort by publish date (newest first)
    videos.sort((a, b) => {
      const dateA = new Date(a.snippet.publishedAt);
      const dateB = new Date(b.snippet.publishedAt);
      return dateB - dateA;
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
