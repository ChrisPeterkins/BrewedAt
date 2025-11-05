# BrewedAt Database Viewer

A Vue.js application for viewing and exploring the BrewedAt SQLite database through the API.

## Features

- 🔍 Browse all database tables
- 📊 View record counts for each table
- 🔎 Search and filter data
- 🎨 Beautiful, modern UI with gradient design
- 📱 Responsive layout

## Access

**Live URL:** https://chrispeterkins.com/brewedat/db-viewer/

## Available Tables

- **events** - All brewery events
- **podcast_episodes** - Podcast episodes
- **raffles** - Active and past raffles
- **raffle_entries** - Raffle participation data
- **contact_submissions** - Contact form submissions
- **site_config** - Site configuration settings
- **users** - User accounts (admin only)

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3006)
npm run dev

# Build for production
npm run build
```

## Production Deployment

The app is running via PM2:

```bash
# Start
pm2 start npm --name "brewedat-db-viewer" -- run dev

# Status
pm2 status brewedat-db-viewer

# Logs
pm2 logs brewedat-db-viewer

# Restart
pm2 restart brewedat-db-viewer

# Stop
pm2 stop brewedat-db-viewer
```

## Architecture

- **Frontend:** Vue 3 with Composition API
- **Build Tool:** Vite
- **Data Source:** BrewedAt REST API (port 3005)
- **Proxy:** Nginx at `/brewedat/db-viewer/`
- **Dev Server:** Port 3006

## API Integration

The viewer connects to the existing BrewedAt API endpoints:
- `/api/events` - Events data
- `/api/podcast` - Podcast episodes
- `/api/raffles` - Raffles
- `/api/contact` - Contact submissions
- `/api/config` - Site configuration

All data is fetched in real-time from the SQLite database via the API.

## Security Note

This tool should be protected with authentication in production. Currently, it relies on the API's existing authentication for admin endpoints.
