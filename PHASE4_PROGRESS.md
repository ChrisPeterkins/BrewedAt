# Phase 4 Progress: Frontend Refactoring

## Summary

Phase 4 is in progress. The goal is to refactor the React frontend to use the new SQLite backend API instead of Firebase.

## Completed ✅

### 1. API Client Library

**File Created**: `web/src/shared/api-client.ts`

A comprehensive TypeScript API client that provides:
- Type-safe interfaces matching backend models
- All CRUD operations for Events, Podcast, Raffles, Contact, Config
- JWT token management (localStorage)
- File upload support
- Consistent error handling
- Singleton instance export

**Features**:
- `apiClient.getEvents()` - Fetch events with optional filters
- `apiClient.getPodcastEpisodes()` - Fetch podcast episodes
- `apiClient.submitContact()` - Submit contact form
- `apiClient.login()` - Admin authentication
- `apiClient.uploadEventImage()` - File uploads
- And 20+ more methods

### 2. Public Pages Updated

#### EventsPage.tsx ✅
- **Before**: Used Firebase Firestore (`collection`, `getDocs`, `query`)
- **After**: Uses `apiClient.getEvents()`
- **Changes**:
  - Removed Firebase imports
  - Import `apiClient` and types from `@shared/api-client`
  - Updated field names: `name` → `title`, `eventDate` → `date`, `eventTime` → `time`
  - Parse date from ISO string instead of Firestore Timestamp
  - `featured` boolean → integer (0 or 1)
  - `websiteUrl`/`ticketUrl` → `externalUrl`

#### PodcastPage.tsx ✅
- **Before**: Used Firebase Firestore with `where` and `orderBy` queries
- **After**: Uses `apiClient.getPodcastEpisodes()`
- **Changes**:
  - Removed Firebase imports
  - Import `apiClient` and types
  - Simplified data fetching (API handles sorting)

#### ForBusinessPage.tsx ✅
- **Before**: ContactForm had no Firebase integration
- **After**: Added `handleContactSubmit` with `apiClient.submitContact()`
- **Changes**:
  - Import `apiClient`
  - Created submit handler to send form data to API
  - Pass `onSubmit` prop to ContactForm component

### 3. Contact Form Integration ✅
- ContactForm component already designed to accept `onSubmit` prop
- ForBusinessPage now provides API-backed submission handler
- Form data transformed to match API schema

## In Progress 🔄

### Remaining Public Pages

#### HomePage.tsx (Not Started)
- Uses Firebase for:
  - Hero content from `siteConfig` collection
  - Featured events
  - Featured podcast episodes
- **Needs**: Update to use `apiClient.getEvents({ featured: true })` and `apiClient.getPodcastEpisodes({ featured: true })`

#### RafflesPage.tsx (Not Checked)
- **Status**: Unknown if this page exists or uses Firebase

## Remaining Work 📋

### 1. Admin Pages (High Priority)

Need to update these admin pages to use API:
- `web/src/admin/pages/Events.tsx` - Event management CRUD
- `web/src/admin/pages/Podcast.tsx` - Podcast management CRUD
- `web/src/admin/pages/Raffles.jsx` - Raffle management CRUD
- `web/src/admin/pages/SiteConfig.tsx` - Site configuration
- `web/src/admin/pages/Login.tsx` - Authentication

### 2. Auth Context (High Priority)

Need to replace Firebase Auth with JWT:
- `web/src/admin/context/AuthContext.tsx` - Admin authentication
- `web/src/public/context/AuthContext.tsx` - Public auth (if used)

**Changes Needed**:
- Replace `signInWithEmailAndPassword` with `apiClient.login()`
- Store JWT token instead of Firebase user
- Verify token with `apiClient.verifyToken()`
- Logout with `apiClient.logout()`

### 3. Image Upload Components (Medium Priority)

- `web/src/admin/components/ImageUpload.tsx`

**Changes Needed**:
- Replace Firebase Storage uploads with API endpoints
- Use `apiClient.uploadEventImage()`, `uploadPodcastImage()`, etc.

### 4. Build & Test (High Priority)

Once all pages are updated:
1. Build the frontend: `cd web && npm run build`
2. Test all public pages
3. Test all admin pages
4. Test authentication flow
5. Test file uploads
6. Fix any TypeScript errors

### 5. Cleanup (Final Step)

- Remove Firebase packages: `npm uninstall firebase`
- Delete Firebase config files:
  - `web/src/shared/firebase.config.ts`
  - `web/src/admin/firebase.config.ts`
  - `web/src/public/firebase.config.ts`
- Remove unused Firebase type definitions
- Update tsconfig paths if needed

## File Changes Summary

### Files Modified (3)
1. ✅ `web/src/public/pages/EventsPage.tsx` - Firebase → API
2. ✅ `web/src/public/pages/PodcastPage.tsx` - Firebase → API
3. ✅ `web/src/public/pages/ForBusinessPage.tsx` - Added API contact submission

### Files Created (1)
1. ✅ `web/src/shared/api-client.ts` - Complete API client library

### Files To Modify (Estimated: 8-10)
- HomePage.tsx
- Events.tsx (admin)
- Podcast.tsx (admin)
- Raffles.jsx (admin)
- SiteConfig.tsx (admin)
- Login.tsx (admin)
- AuthContext.tsx (admin)
- ImageUpload.tsx (admin)
- Plus any other Firebase-dependent files

## Field Name Mapping Reference

For developers updating components:

| Firebase Field | SQLite Field | Notes |
|----------------|--------------|-------|
| `name` | `title` | Events & Podcasts |
| `eventDate` | `date` | ISO string (YYYY-MM-DD) |
| `eventTime` | `time` | String |
| `websiteUrl` | `externalUrl` | Events |
| `ticketUrl` | `externalUrl` | Events |
| `featured` (boolean) | `featured` (0 or 1) | Integer in SQLite |
| `publishDate` | `publishDate` | ISO string |
| `videoType` | N/A | Removed (not in schema) |

## Date Handling

**Before (Firebase)**:
```typescript
event.eventDate.toDate().toLocaleDateString()
```

**After (SQLite)**:
```typescript
new Date(event.date).toLocaleDateString()
```

## API Response Format

All API calls return:
```typescript
{
  success: boolean;
  data?: T;
  error?: string;
}
```

Always check `response.success` before using `response.data`.

## Estimated Completion Time

- **Remaining Public Pages**: 1-2 hours
- **Admin Pages**: 3-4 hours
- **Auth Context**: 1-2 hours
- **Image Uploads**: 1 hour
- **Build & Testing**: 2-3 hours
- **Cleanup**: 30 minutes

**Total**: 8-12 hours of development work

## Testing Checklist

Once complete, test:
- [ ] Public site loads
- [ ] Events page displays events
- [ ] Podcast page displays episodes
- [ ] Contact form submits successfully
- [ ] Admin login works
- [ ] Admin can create/edit/delete events
- [ ] Admin can create/edit/delete podcasts
- [ ] Admin can upload images
- [ ] Featured items display on homepage
- [ ] No Firebase references in console
- [ ] No TypeScript errors
- [ ] Production build succeeds

## Next Steps

1. Update HomePage.tsx to use API
2. Update all admin pages (Events, Podcast, Raffles, Login)
3. Refactor AuthContext for JWT authentication
4. Update ImageUpload component
5. Build and test thoroughly
6. Remove Firebase dependencies
7. Deploy updated frontend

## Status

🟡 **Phase 4: 30% Complete**

- ✅ API Client created
- ✅ 3 public pages updated
- 🔄 8-10 files remaining
- ⏳ Estimated 8-12 hours to completion
