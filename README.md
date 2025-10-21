# BrewedAt Platform

Full-stack platform for craft beer events, content, and community engagement.

## Project Structure

```
BrewedAt/
├── mobile/          # React Native mobile app (iOS/Android)
├── web/             # React + TypeScript web platform
│   ├── src/
│   │   ├── admin/       # Admin dashboard (CMS)
│   │   ├── public-site/ # Public website
│   │   └── shared/      # Shared code and types
│   └── dist/        # Production builds
├── firebase.json    # Firebase hosting & services config
├── firestore.rules  # Firestore security rules
└── firestore.indexes.json  # Firestore indexes
```

## Quick Start

### Web Platform (Admin + Public Site)

```bash
cd web
npm install

# Run both admin and public site
npm run dev

# Run individually
npm run dev:admin   # Admin dashboard on http://localhost:5173
npm run dev:public  # Public site on http://localhost:5174

# Build for production
npm run build
```

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

## Features

### Admin Dashboard (CMS)
- 📅 **Events Management** - Create, edit, delete events with image uploads
- 🎙️ **Podcast Episodes** - Full podcast content management
- ✏️ **Homepage Content** - Edit hero sections, stats, and about text
- 📊 **Analytics** - Track event views and engagement metrics
- 🍺 **Breweries** - Manage brewery listings
- 🎟️ **Raffles** - Create and manage raffles
- ⚙️ **Settings** - Social media stats and site configuration

### Public Website
- Event listings and details
- Podcast episodes
- Brewery directory
- Dynamic content from admin dashboard
- Responsive design

### Mobile App
- Browse events
- Check-in to locations
- Earn points and rewards
- Social features

## Tech Stack

### Web
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Backend**: Firebase (Firestore, Auth, Storage, Hosting)
- **Styling**: CSS-in-JS

### Mobile
- **Framework**: React Native + Expo
- **Backend**: Firebase

## Firebase Services

- **Firestore**: NoSQL database for events, users, content
- **Authentication**: User management for admin and mobile
- **Storage**: Image and media uploads
- **Hosting**: Web deployment
- **Analytics**: (Optional) Track usage

## Development Workflow

1. **Local Development**: Use `npm run dev` in web/ or `npx expo start` in mobile/
2. **Admin Access**: Login at `http://localhost:5173` with Firebase admin credentials
3. **Content Management**: Use admin dashboard to manage all content
4. **Testing**: Changes appear immediately on public site
5. **Deployment**: `firebase deploy` for web, Expo build for mobile

## Deployment

### Web (Firebase Hosting)

```bash
cd web
npm run build
cd ..
firebase deploy --only hosting
```

### Mobile (App Stores)

```bash
cd mobile
# iOS
npx expo build:ios

# Android
npx expo build:android
```

## Environment Variables

Firebase configuration is stored in:
- `web/src/shared/firebase.config.ts`
- `mobile/firebase.config.js`

## Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Commit with descriptive messages
5. Push to GitHub

## License

Proprietary - BrewedAt

## Support

For issues or questions, contact the development team.
