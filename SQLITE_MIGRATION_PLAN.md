# SQLite Migration Plan for BrewedAt

## Executive Summary

This document outlines the complete migration from Firebase Firestore to SQLite for the BrewedAt application. The migration involves 8 collections, 17 code files, and includes both database schema design and application refactoring.

## Current State Analysis

### Firebase Collections (8 total)

1. **events** - Brewery events and taproom happenings
2. **podcastEpisodes** - Podcast episode metadata
3. **raffles** - Raffle campaigns
4. **raffleEntries** - User entries for raffles
5. **contactSubmissions** - Contact form submissions
6. **siteConfig** - Site-wide configuration
7. **users** - User accounts
8. **checkins** - User check-ins at breweries

### Files Using Firebase (17 files)

**Configuration:**
- `src/shared/firebase.config.ts`
- `src/admin/firebase.config.ts`
- `src/public/firebase.config.ts`

**Admin Pages:**
- `src/admin/pages/Events.tsx`
- `src/admin/pages/Podcast.tsx`
- `src/admin/pages/Raffles.jsx`
- `src/admin/pages/SiteConfig.tsx`
- `src/admin/pages/Login.tsx`

**Public Pages:**
- `src/public/pages/EventsPage.tsx`
- `src/public/pages/PodcastPage.tsx`
- `src/public/pages/RafflesPage.tsx`

**Components:**
- `src/admin/components/ImageUpload.tsx`
- `src/public/components/AudienceToggle.tsx`
- `src/public/components/ContactForm.tsx`
- `src/public/components/RaffleEntryForm.tsx`

**Context:**
- `src/admin/context/AuthContext.tsx`
- `src/public/context/AuthContext.tsx`

### Firebase Storage Usage

- **Events images**: `/events/{eventId}/{filename}`
- **Podcast images**: `/podcast/{episodeId}/{filename}`
- **Raffle images**: `/raffles/{raffleId}/{filename}`

## Migration Plan

### Phase 1: Database Design & Setup

#### 1.1 Create SQLite Schema

```sql
-- events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT,
  brewery TEXT,
  breweryLogo TEXT,
  eventType TEXT,
  imageUrl TEXT,
  externalUrl TEXT,
  featured INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_featured ON events(featured);
CREATE INDEX idx_events_brewery ON events(brewery);

-- podcast_episodes table
CREATE TABLE podcast_episodes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  publishDate TEXT NOT NULL,
  duration TEXT,
  audioUrl TEXT,
  imageUrl TEXT,
  spotifyUrl TEXT,
  appleUrl TEXT,
  youtubeUrl TEXT,
  featured INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX idx_podcast_publishDate ON podcast_episodes(publishDate);
CREATE INDEX idx_podcast_featured ON podcast_episodes(featured);

-- raffles table
CREATE TABLE raffles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  imageUrl TEXT,
  prizeDetails TEXT,
  rules TEXT,
  active INTEGER DEFAULT 1,
  winnerAnnounced INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX idx_raffles_active ON raffles(active);
CREATE INDEX idx_raffles_dates ON raffles(startDate, endDate);

-- raffle_entries table
CREATE TABLE raffle_entries (
  id TEXT PRIMARY KEY,
  raffleId TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  submittedAt TEXT NOT NULL,
  FOREIGN KEY (raffleId) REFERENCES raffles(id) ON DELETE CASCADE
);

CREATE INDEX idx_raffle_entries_raffleId ON raffle_entries(raffleId);
CREATE INDEX idx_raffle_entries_email ON raffle_entries(email);

-- contact_submissions table
CREATE TABLE contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  audienceType TEXT,
  submittedAt TEXT NOT NULL
);

CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_submittedAt ON contact_submissions(submittedAt);

-- site_config table
CREATE TABLE site_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  displayName TEXT,
  photoUrl TEXT,
  role TEXT DEFAULT 'user',
  createdAt TEXT NOT NULL,
  lastLoginAt TEXT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- checkins table
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  breweryId TEXT NOT NULL,
  breweryName TEXT NOT NULL,
  checkinDate TEXT NOT NULL,
  notes TEXT,
  rating INTEGER,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_checkins_userId ON checkins(userId);
CREATE INDEX idx_checkins_breweryId ON checkins(breweryId);
CREATE INDEX idx_checkins_date ON checkins(checkinDate);
```

#### 1.2 Initialize Database

- Database location: `/var/www/chrispeterkins.com/brewedat/brewedat.db`
- Use `better-sqlite3` for Node.js
- Create database initialization script

### Phase 2: Backend API Setup

#### 2.1 Install Dependencies

```bash
npm install better-sqlite3 @types/better-sqlite3 express cors dotenv multer
npm install --save-dev @types/express @types/cors @types/multer
```

#### 2.2 Create API Server Structure

```
/var/www/chrispeterkins.com/brewedat/
├── api/
│   ├── server.ts              # Express server setup
│   ├── db.ts                  # SQLite connection & queries
│   ├── routes/
│   │   ├── events.ts          # Events CRUD endpoints
│   │   ├── podcast.ts         # Podcast CRUD endpoints
│   │   ├── raffles.ts         # Raffles CRUD endpoints
│   │   ├── contact.ts         # Contact form endpoint
│   │   └── config.ts          # Site config endpoints
│   ├── middleware/
│   │   ├── auth.ts            # Authentication middleware
│   │   └── upload.ts          # File upload handling
│   └── utils/
│       └── validation.ts      # Input validation
├── uploads/                   # Local file storage
│   ├── events/
│   ├── podcast/
│   └── raffles/
└── brewedat.db               # SQLite database
```

#### 2.3 API Endpoints to Implement

**Events:**
- `GET /api/events` - List all events (with pagination, filtering)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `POST /api/events/:id/image` - Upload event image

**Podcast:**
- `GET /api/podcast` - List all episodes
- `GET /api/podcast/:id` - Get single episode
- `POST /api/podcast` - Create episode (admin only)
- `PUT /api/podcast/:id` - Update episode (admin only)
- `DELETE /api/podcast/:id` - Delete episode (admin only)
- `POST /api/podcast/:id/image` - Upload episode image

**Raffles:**
- `GET /api/raffles` - List active raffles
- `GET /api/raffles/:id` - Get single raffle
- `POST /api/raffles` - Create raffle (admin only)
- `PUT /api/raffles/:id` - Update raffle (admin only)
- `DELETE /api/raffles/:id` - Delete raffle (admin only)
- `POST /api/raffles/:id/enter` - Submit raffle entry
- `GET /api/raffles/:id/entries` - List entries (admin only)

**Contact:**
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - List submissions (admin only)

**Config:**
- `GET /api/config` - Get all site config
- `GET /api/config/:key` - Get single config value
- `PUT /api/config/:key` - Update config value (admin only)

**Authentication:**
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token

### Phase 3: Data Migration

#### 3.1 Export Firebase Data

Create script: `scripts/export-firebase-data.ts`

```typescript
// Export all Firestore collections to JSON files
// Handle nested data and timestamp conversion
// Validate data completeness
```

#### 3.2 Import to SQLite

Create script: `scripts/import-to-sqlite.ts`

```typescript
// Read JSON exports
// Transform data to match SQL schema
// Insert into SQLite tables
// Verify row counts match
```

#### 3.3 File Migration

- Copy images from Firebase Storage to local `/uploads` directory
- Update image URLs in database records
- Verify all files transferred successfully

### Phase 4: Frontend Refactoring

#### 4.1 Remove Firebase Dependencies

Files to update:
- Delete `src/shared/firebase.config.ts`
- Delete `src/admin/firebase.config.ts`
- Delete `src/public/firebase.config.ts`

#### 4.2 Create API Client Library

Create `src/shared/api-client.ts`:

```typescript
// Wrapper for fetch() calls to backend API
// Handle authentication tokens
// Error handling and retries
// Type-safe interfaces matching backend models
```

#### 4.3 Update Admin Pages

- `src/admin/pages/Events.tsx` - Use API instead of Firestore
- `src/admin/pages/Podcast.tsx` - Use API instead of Firestore
- `src/admin/pages/Raffles.jsx` - Use API instead of Firestore
- `src/admin/pages/SiteConfig.tsx` - Use API instead of Firestore
- `src/admin/pages/Login.tsx` - Use API auth endpoint

#### 4.4 Update Public Pages

- `src/public/pages/EventsPage.tsx` - Fetch from API
- `src/public/pages/PodcastPage.tsx` - Fetch from API
- `src/public/pages/RafflesPage.tsx` - Fetch from API

#### 4.5 Update Components

- `src/admin/components/ImageUpload.tsx` - Upload to API endpoint
- `src/public/components/ContactForm.tsx` - Submit to API
- `src/public/components/RaffleEntryForm.tsx` - Submit to API

#### 4.6 Update Auth Context

- `src/admin/context/AuthContext.tsx` - JWT-based auth instead of Firebase Auth
- `src/public/context/AuthContext.tsx` - Remove if not needed for public users

### Phase 5: Testing

#### 5.1 Backend Testing

- [ ] All API endpoints return correct data
- [ ] Authentication middleware works correctly
- [ ] File uploads save properly
- [ ] Database queries are performant
- [ ] Error handling works as expected

#### 5.2 Admin Dashboard Testing

- [ ] Can view all events/podcast/raffles
- [ ] Can create new items
- [ ] Can edit existing items
- [ ] Can delete items
- [ ] Image uploads work
- [ ] Login/logout works

#### 5.3 Public Site Testing

- [ ] Events page displays correctly
- [ ] Podcast page displays correctly
- [ ] Raffles page displays correctly
- [ ] Contact form submits successfully
- [ ] Raffle entry form submits successfully
- [ ] Featured items display correctly

#### 5.4 Data Integrity Testing

- [ ] All Firebase data migrated successfully
- [ ] No data loss during migration
- [ ] Image URLs resolve correctly
- [ ] Date/time formats display correctly

### Phase 6: Deployment

#### 6.1 Server Setup

- Install Node.js backend alongside Vite build
- Configure PM2 or systemd for API server
- Set up environment variables
- Configure file upload permissions

#### 6.2 Nginx Configuration

Update `/etc/nginx/sites-enabled/chrispeterkins.com`:

```nginx
# BrewedAt API
location /brewedat/api/ {
    proxy_pass http://localhost:3005/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# BrewedAt uploaded images
location /brewedat/uploads/ {
    alias /var/www/chrispeterkins.com/brewedat/uploads/;
    expires 365d;
    access_log off;
}
```

#### 6.3 Build & Deploy

```bash
# Build frontend
npm run build

# Start API server
pm2 start api/server.ts --name brewedat-api

# Reload Nginx
sudo systemctl reload nginx
```

### Phase 7: Cleanup

#### 7.1 Remove Firebase

- Uninstall Firebase packages: `npm uninstall firebase`
- Remove Firebase config from `.env` files
- Archive Firebase project (don't delete immediately)

#### 7.2 Documentation

- Update README with new setup instructions
- Document API endpoints
- Document database schema
- Create backup procedures documentation

## Rollback Plan

If migration fails:

1. Keep Firebase project active during migration
2. Have Firebase credentials available
3. Git commit before each major change
4. Can revert frontend to use Firebase config
5. Keep Firebase data for 30 days after successful migration

## Timeline Estimate

- **Phase 1** (Database Setup): 2-4 hours
- **Phase 2** (Backend API): 8-12 hours
- **Phase 3** (Data Migration): 4-6 hours
- **Phase 4** (Frontend Refactor): 8-12 hours
- **Phase 5** (Testing): 6-8 hours
- **Phase 6** (Deployment): 2-4 hours
- **Phase 7** (Cleanup): 2-3 hours

**Total**: 32-49 hours (~1-2 weeks of work)

## Benefits of SQLite Migration

1. **Cost**: Free vs Firebase pricing
2. **Performance**: Local database, no network latency
3. **Control**: Full control over data and backups
4. **Simplicity**: No external dependencies
5. **Privacy**: Data stays on your server
6. **Portability**: Single file database, easy to backup/restore

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Data loss during migration | Export all Firebase data first, verify before deletion |
| Downtime during deployment | Deploy API first, test, then update frontend |
| Performance issues | Add proper indexes, test with realistic data volume |
| File storage issues | Use proper permissions, test uploads early |
| Authentication issues | Implement JWT auth carefully, test thoroughly |

## Post-Migration Monitoring

- Monitor API response times
- Check error logs daily for first week
- Verify backups are working
- Monitor disk space usage for database and uploads
- Test admin functions regularly
