# BrewedAt Web Platform

This directory contains the unified web platform for BrewedAt, including both the public website and the admin dashboard.

## 📁 Project Structure

```
web/
├── src/
│   ├── admin/               # Admin dashboard (React)
│   │   ├── components/      # Reusable admin components
│   │   ├── pages/           # Admin page components
│   │   ├── App.jsx          # Main admin app component
│   │   ├── main.jsx         # Admin entry point
│   │   ├── index.html       # Admin HTML template
│   │   └── firebase.config.js  # Re-exports shared Firebase config
│   ├── public-site/         # Public website (Static HTML/CSS/JS)
│   │   ├── *.html           # Website pages
│   │   ├── script.js        # Website JavaScript
│   │   ├── styles.css       # Website styles
│   │   └── events.js        # Event-specific scripts
│   └── shared/              # Shared utilities & config
│       └── firebase.config.js  # Firebase configuration (single source of truth)
├── dist/                    # Build output (generated)
│   ├── admin/               # Built admin dashboard
│   └── public/              # Built public website
├── package.json             # Dependencies & scripts
├── vite.admin.config.js     # Vite config for admin
└── vite.public.config.js    # Vite config for public site
```

## 🚀 Getting Started

### Installation

```bash
cd web
npm install
```

### Development

**Run both sites simultaneously:**
```bash
npm run dev
```

**Run admin dashboard only:**
```bash
npm run dev:admin
# Opens at http://localhost:5173
```

**Run public website only:**
```bash
npm run dev:public
# Opens at http://localhost:5174
```

### Building for Production

**Build both sites:**
```bash
npm run build
```

**Build individually:**
```bash
npm run build:admin   # Outputs to dist/admin/
npm run build:public  # Outputs to dist/public/
```

## 🔥 Firebase Deployment

### Prerequisites

1. Make sure you're in the **project root** (not the `web/` folder)
2. Firebase CLI must be installed: `npm install -g firebase-tools`
3. You must be logged in: `firebase login`

### Deploy

**From project root:**

```bash
# Build web projects first (from web folder)
cd web && npm run build && cd ..

# Deploy everything (Firestore rules + hosting)
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only public site
firebase deploy --only hosting:public

# Deploy only admin dashboard
firebase deploy --only hosting:admin
```

### Hosting Targets

This project uses Firebase Hosting targets:
- **public**: Main website (brewedat.web.app or your custom domain)
- **admin**: Admin dashboard (brewedat-admin.web.app or admin.yourdomain.com)

## 🏗️ Architecture Benefits

### ✅ What This Solves

1. **Single Codebase**: All web code in one place
2. **Shared Configuration**: Firebase config used by both admin and public site
3. **Unified Dependencies**: One `node_modules`, one `package.json`
4. **Consistent Builds**: Single build command for everything
5. **Easier Deployment**: Deploy both sites with one command
6. **Better Developer Experience**: Run both sites simultaneously for testing

### 🔒 Security

- Admin dashboard requires Firebase Authentication
- Firestore rules protect admin-only operations
- Admin can be deployed to separate subdomain (admin.brewedat.com)
- Public site can read social media stats, but only admins can write

## 📝 Key Files

### `src/shared/firebase.config.js`
**Single source of truth** for Firebase configuration. Both admin and public site import from here.

### `vite.admin.config.js`
Configures build for React admin dashboard:
- Entry point: `src/admin/index.html`
- Output: `dist/admin/`
- Aliases: `@admin`, `@shared`

### `vite.public.config.js`
Configures build for static public website:
- Multiple HTML entry points (index, events, podcast, etc.)
- Output: `dist/public/`
- Alias: `@shared`

## 🎯 Common Tasks

### Adding a New Public Page

1. Create `src/public-site/new-page.html`
2. Add to `vite.public.config.js` rollupOptions.input
3. Build and deploy

### Updating Social Media Stats

1. Go to admin dashboard
2. Navigate to "Data Management" tab
3. Update follower counts
4. Click "Save Social Media Stats"
5. Changes appear on public website immediately

### Sharing Code Between Admin & Public

Put shared utilities in `src/shared/` and import using `@shared` alias:

```javascript
// In admin or public site
import { db, auth } from '@shared/firebase.config.js';
```

## 🐛 Troubleshooting

**Build fails with "Cannot find module":**
- Run `npm install` in the `web/` directory
- Check that file paths in Vite configs are correct

**Firebase deployment fails:**
- Make sure you're in the **project root**, not `web/`
- Run `npm run build` from `web/` folder first
- Check that `dist/admin` and `dist/public` folders exist

**Admin dashboard shows blank page:**
- Check browser console for errors
- Verify Firebase config is correct
- Make sure you're logged in with an admin account

## 📚 Related Documentation

- Main project README: `../README.md`
- Firebase integration: `../website/FIREBASE_INTEGRATION.md`
- Firestore rules: `../firestore.rules`

## 🎓 Learning Resources

- [Vite Documentation](https://vite.dev)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [React Documentation](https://react.dev)

---

**Need help?** Check the main project README or reach out to the team.
