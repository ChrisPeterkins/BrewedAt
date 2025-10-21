# Import Podcast Episodes from YouTube

This script automatically imports all podcast episodes from your YouTube channel into Firestore.

## Setup Instructions

### 1. Get a YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your existing "BrewedAt" project
3. Enable the **YouTube Data API v3**:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

### 2. Install Dependencies

```bash
npm install firebase-admin node-fetch@2
```

### 3. Run the Import Script

```bash
export YOUTUBE_API_KEY="your-api-key-here"
node import-podcast-episodes.js
```

## What It Does

- Fetches all videos from your YouTube channel
- Extracts episode number from video titles (e.g., "#60", "Episode 60")
- Imports the following data for each episode:
  - Episode number
  - Title
  - Description
  - Publish date
  - YouTube URL
  - Thumbnail image
  - Guest name (extracted from title if available)
- Uploads everything to Firestore `podcastEpisodes` collection

## What You'll Need to Add Manually

After import, you can use the admin panel to add:
- Spotify URLs
- Apple Podcast URLs
- Duration
- Mark episodes as "Featured"

## Notes

- The script skips videos that don't have an episode number in the title
- Episodes are sorted by episode number (newest first)
- The script won't create duplicates - run it once and verify in admin panel
