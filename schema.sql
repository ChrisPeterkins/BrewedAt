-- BrewedAt SQLite Database Schema
-- Created: 2025-11-05
-- Description: Complete database schema for BrewedAt application

-- Drop tables if they exist (for clean re-initialization)
DROP TABLE IF EXISTS checkins;
DROP TABLE IF EXISTS raffle_entries;
DROP TABLE IF EXISTS raffles;
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS site_config;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS podcast_episodes;
DROP TABLE IF EXISTS events;

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
-- Stores brewery events, taproom happenings, and related information
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,                    -- ISO 8601 format: YYYY-MM-DD
  time TEXT,                              -- Format: HH:MM or "TBD"
  location TEXT,                          -- Venue address or name
  brewery TEXT,                           -- Brewery name
  breweryLogo TEXT,                       -- URL to brewery logo
  eventType TEXT,                         -- e.g., "tasting", "live-music", "release"
  imageUrl TEXT,                          -- URL to event image
  externalUrl TEXT,                       -- Link to external event page
  featured INTEGER DEFAULT 0,             -- 1 if featured, 0 if not
  createdAt TEXT NOT NULL,                -- ISO 8601 datetime
  updatedAt TEXT NOT NULL                 -- ISO 8601 datetime
);

-- Indexes for efficient querying
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_featured ON events(featured);
CREATE INDEX idx_events_brewery ON events(brewery);
CREATE INDEX idx_events_type ON events(eventType);

-- ============================================================================
-- PODCAST EPISODES TABLE
-- ============================================================================
-- Stores podcast episode metadata and streaming links
CREATE TABLE podcast_episodes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  publishDate TEXT NOT NULL,              -- ISO 8601 format: YYYY-MM-DD
  duration TEXT,                          -- Format: "HH:MM:SS" or minutes
  audioUrl TEXT,                          -- Direct audio file URL
  imageUrl TEXT,                          -- Episode artwork URL
  spotifyUrl TEXT,                        -- Spotify episode link
  appleUrl TEXT,                          -- Apple Podcasts link
  youtubeUrl TEXT,                        -- YouTube video link
  featured INTEGER DEFAULT 0,             -- 1 if featured, 0 if not
  createdAt TEXT NOT NULL,                -- ISO 8601 datetime
  updatedAt TEXT NOT NULL                 -- ISO 8601 datetime
);

-- Indexes for efficient querying
CREATE INDEX idx_podcast_publishDate ON podcast_episodes(publishDate DESC);
CREATE INDEX idx_podcast_featured ON podcast_episodes(featured);

-- ============================================================================
-- RAFFLES TABLE
-- ============================================================================
-- Stores raffle campaigns and prize information
CREATE TABLE raffles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  startDate TEXT NOT NULL,                -- ISO 8601 format: YYYY-MM-DD
  endDate TEXT NOT NULL,                  -- ISO 8601 format: YYYY-MM-DD
  imageUrl TEXT,                          -- Prize image URL
  prizeDetails TEXT,                      -- Detailed prize description
  rules TEXT,                             -- Raffle rules and T&Cs
  active INTEGER DEFAULT 1,               -- 1 if active, 0 if inactive
  winnerAnnounced INTEGER DEFAULT 0,      -- 1 if winner announced, 0 if not
  createdAt TEXT NOT NULL,                -- ISO 8601 datetime
  updatedAt TEXT NOT NULL                 -- ISO 8601 datetime
);

-- Indexes for efficient querying
CREATE INDEX idx_raffles_active ON raffles(active);
CREATE INDEX idx_raffles_dates ON raffles(startDate, endDate);
CREATE INDEX idx_raffles_winner ON raffles(winnerAnnounced);

-- ============================================================================
-- RAFFLE ENTRIES TABLE
-- ============================================================================
-- Stores user entries for raffles
CREATE TABLE raffle_entries (
  id TEXT PRIMARY KEY,
  raffleId TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  submittedAt TEXT NOT NULL,              -- ISO 8601 datetime
  FOREIGN KEY (raffleId) REFERENCES raffles(id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX idx_raffle_entries_raffleId ON raffle_entries(raffleId);
CREATE INDEX idx_raffle_entries_email ON raffle_entries(email);
CREATE INDEX idx_raffle_entries_submitted ON raffle_entries(submittedAt);

-- Unique constraint to prevent duplicate entries
CREATE UNIQUE INDEX idx_raffle_entries_unique ON raffle_entries(raffleId, email);

-- ============================================================================
-- CONTACT SUBMISSIONS TABLE
-- ============================================================================
-- Stores contact form submissions from the website
CREATE TABLE contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  audienceType TEXT,                      -- e.g., "brewery", "brand", "sponsor"
  submittedAt TEXT NOT NULL               -- ISO 8601 datetime
);

-- Indexes for efficient querying
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_submittedAt ON contact_submissions(submittedAt DESC);
CREATE INDEX idx_contact_submissions_audienceType ON contact_submissions(audienceType);

-- ============================================================================
-- SITE CONFIG TABLE
-- ============================================================================
-- Stores site-wide configuration key-value pairs
CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt TEXT NOT NULL                 -- ISO 8601 datetime
);

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user accounts (primarily for admin authentication)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  displayName TEXT,
  photoUrl TEXT,
  role TEXT DEFAULT 'user',               -- e.g., "user", "admin"
  passwordHash TEXT,                      -- bcrypt hash (for JWT auth)
  createdAt TEXT NOT NULL,                -- ISO 8601 datetime
  lastLoginAt TEXT                        -- ISO 8601 datetime
);

-- Indexes for efficient querying
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- CHECKINS TABLE
-- ============================================================================
-- Stores user check-ins at breweries
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  breweryId TEXT NOT NULL,
  breweryName TEXT NOT NULL,
  checkinDate TEXT NOT NULL,              -- ISO 8601 datetime
  notes TEXT,
  rating INTEGER,                         -- 1-5 star rating
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX idx_checkins_userId ON checkins(userId);
CREATE INDEX idx_checkins_breweryId ON checkins(breweryId);
CREATE INDEX idx_checkins_date ON checkins(checkinDate DESC);

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================
-- Uncomment to insert sample data for testing

/*
INSERT INTO site_config (key, value, updatedAt) VALUES
  ('siteName', 'BrewedAt', datetime('now')),
  ('maintenanceMode', 'false', datetime('now')),
  ('featuredEventLimit', '3', datetime('now'));

INSERT INTO users (id, email, displayName, role, createdAt) VALUES
  ('admin-1', 'admin@brewedat.com', 'Admin User', 'admin', datetime('now'));
*/
