-- Migration: Add Tags System
-- Created: 2025-12-03
-- Description: Adds tags and event_tags tables for event categorization

-- ============================================================================
-- TAGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  createdAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_category ON tags(name, category);

-- ============================================================================
-- EVENT_TAGS JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_tags (
  eventId TEXT NOT NULL,
  tagId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  PRIMARY KEY (eventId, tagId),
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_tags_eventId ON event_tags(eventId);
CREATE INDEX IF NOT EXISTS idx_event_tags_tagId ON event_tags(tagId);

-- ============================================================================
-- PREPOPULATED TAGS
-- ============================================================================

-- Entertainment Category
INSERT OR IGNORE INTO tags (id, name, category, color, createdAt) VALUES
  ('tag-live-music', 'Live Music', 'entertainment', '#9333EA', datetime('now')),
  ('tag-dj', 'DJ', 'entertainment', '#A855F7', datetime('now')),
  ('tag-trivia', 'Trivia', 'entertainment', '#7C3AED', datetime('now')),
  ('tag-karaoke', 'Karaoke', 'entertainment', '#8B5CF6', datetime('now')),
  ('tag-comedy', 'Comedy', 'entertainment', '#6D28D9', datetime('now')),
  ('tag-open-mic', 'Open Mic', 'entertainment', '#5B21B6', datetime('now'));

-- Video Games Category
INSERT OR IGNORE INTO tags (id, name, category, color, createdAt) VALUES
  ('tag-mario-kart', 'Mario Kart', 'video-games', '#EF4444', datetime('now')),
  ('tag-smash-bros', 'Smash Bros', 'video-games', '#F87171', datetime('now')),
  ('tag-retro-gaming', 'Retro Gaming', 'video-games', '#DC2626', datetime('now')),
  ('tag-video-game-tournament', 'Video Game Tournament', 'video-games', '#B91C1C', datetime('now')),
  ('tag-board-games', 'Board Games', 'video-games', '#991B1B', datetime('now')),
  ('tag-arcade', 'Arcade', 'video-games', '#7F1D1D', datetime('now'));

-- Beverages Category
INSERT OR IGNORE INTO tags (id, name, category, color, createdAt) VALUES
  ('tag-craft-beer', 'Craft Beer', 'beverages', '#F59E0B', datetime('now')),
  ('tag-ipa', 'IPA', 'beverages', '#FBBF24', datetime('now')),
  ('tag-stout', 'Stout', 'beverages', '#D97706', datetime('now')),
  ('tag-lager', 'Lager', 'beverages', '#B45309', datetime('now')),
  ('tag-sour', 'Sour', 'beverages', '#92400E', datetime('now')),
  ('tag-cider', 'Cider', 'beverages', '#78350F', datetime('now')),
  ('tag-wine', 'Wine', 'beverages', '#DC2626', datetime('now')),
  ('tag-cocktails', 'Cocktails', 'beverages', '#10B981', datetime('now')),
  ('tag-non-alcoholic', 'Non-Alcoholic', 'beverages', '#6B7280', datetime('now'));

-- Event Focus/Purpose Category
INSERT OR IGNORE INTO tags (id, name, category, color, createdAt) VALUES
  ('tag-tasting', 'Tasting', 'event-focus', '#3B82F6', datetime('now')),
  ('tag-release-party', 'Release Party', 'event-focus', '#2563EB', datetime('now')),
  ('tag-tap-takeover', 'Tap Takeover', 'event-focus', '#1D4ED8', datetime('now')),
  ('tag-beer-dinner', 'Beer Dinner', 'event-focus', '#1E40AF', datetime('now')),
  ('tag-brewery-tour', 'Brewery Tour', 'event-focus', '#1E3A8A', datetime('now')),
  ('tag-meet-the-brewer', 'Meet the Brewer', 'event-focus', '#312E81', datetime('now')),
  ('tag-charity-event', 'Charity Event', 'event-focus', '#EC4899', datetime('now')),
  ('tag-anniversary', 'Anniversary', 'event-focus', '#DB2777', datetime('now')),
  ('tag-grand-opening', 'Grand Opening', 'event-focus', '#BE185D', datetime('now'));

-- Activity Category
INSERT OR IGNORE INTO tags (id, name, category, color, createdAt) VALUES
  ('tag-brewery-crawl', 'Brewery Crawl', 'activity', '#14B8A6', datetime('now')),
  ('tag-beer-run', 'Beer Run', 'activity', '#0D9488', datetime('now')),
  ('tag-yoga', 'Yoga', 'activity', '#0F766E', datetime('now')),
  ('tag-paint-night', 'Paint Night', 'activity', '#115E59', datetime('now')),
  ('tag-bingo', 'Bingo', 'activity', '#134E4A', datetime('now')),
  ('tag-food-truck', 'Food Truck', 'activity', '#022C22', datetime('now')),
  ('tag-outdoor', 'Outdoor', 'activity', '#15803D', datetime('now')),
  ('tag-dog-friendly', 'Dog Friendly', 'activity', '#16A34A', datetime('now')),
  ('tag-family-friendly', 'Family Friendly', 'activity', '#22C55E', datetime('now'));

-- Sports Category
INSERT OR IGNORE INTO tags (id, name, category, color, createdAt) VALUES
  ('tag-watch-party', 'Watch Party', 'sports', '#F97316', datetime('now')),
  ('tag-eagles', 'Eagles', 'sports', '#065F46', datetime('now')),
  ('tag-phillies', 'Phillies', 'sports', '#DC2626', datetime('now')),
  ('tag-sixers', 'Sixers', 'sports', '#1E40AF', datetime('now')),
  ('tag-flyers', 'Flyers', 'sports', '#EA580C', datetime('now')),
  ('tag-union', 'Union', 'sports', '#1D4ED8', datetime('now'));
