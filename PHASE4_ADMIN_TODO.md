# Phase 4: Admin Pages Remaining Work

## Summary

The public-facing pages have been successfully updated to use the SQLite API. The admin pages require more complex refactoring as they handle CRUD operations, image uploads, and authentication.

## Completed Public Pages ✅

1. **EventsPage.tsx** - Uses `apiClient.getEvents()`
2. **PodcastPage.tsx** - Uses `apiClient.getPodcastEpisodes()`
3. **ForBusinessPage.tsx** - Uses `apiClient.submitContact()`
4. **HomePage.tsx** - Uses API for featured content and config

## Remaining Admin Pages 🔄

### 1. admin/pages/Events.tsx (CRITICAL)

**Current Firebase Operations:**
- `getDocs()` - Load all events
- `addDoc()` - Create new event
- `updateDoc()` - Update existing event
- `deleteDoc()` - Delete event
- `uploadBytes()` + `getDownloadURL()` - Upload images to Firebase Storage

**Required Changes:**
```typescript
// BEFORE
const eventsRef = collection(db, 'events');
const snapshot = await getDocs(eventsRef);

// AFTER
const response = await apiClient.getEvents();
if (response.success) setEvents(response.data);
```

```typescript
// BEFORE - Create
await addDoc(collection(db, 'events'), eventData);

// AFTER - Create
await apiClient.createEvent({
  title: formData.name,
  date: formData.eventDate.toISOString().split('T')[0],
  time: formData.eventTime,
  location: formData.address,
  brewery: formData.location,
  eventType: formData.eventType,
  featured: formData.featured ? 1 : 0,
  ...
});
```

```typescript
// BEFORE - Update
await updateDoc(doc(db, 'events', eventId), eventData);

// AFTER - Update
await apiClient.updateEvent(eventId, updatedData);
```

```typescript
// BEFORE - Delete
await deleteDoc(doc(db, 'events', eventId));

// AFTER - Delete
await apiClient.deleteEvent(eventId);
```

```typescript
// BEFORE - Image Upload
const storageRef = ref(storage, `events/${eventId}/${file.name}`);
await uploadBytes(storageRef, file);
const url = await getDownloadURL(storageRef);

// AFTER - Image Upload
const response = await apiClient.uploadEventImage(eventId, file);
if (response.success) {
  imageUrl = response.data.imageUrl;
}
```

**Form Data Transformation:**
- `name` → `title`
- `eventDate` (Date object) → `date` (YYYY-MM-DD string)
- `eventTime` → `time`
- `address` → `location`
- `location` → `brewery`
- `websiteUrl` / `ticketUrl` → `externalUrl`
- `featured` (boolean) → `featured` (0 or 1)

### 2. admin/pages/Podcast.tsx (CRITICAL)

**Current Firebase Operations:**
- `getDocs()` - Load all episodes
- `addDoc()` - Create new episode
- `updateDoc()` - Update existing episode
- `deleteDoc()` - Delete episode
- Firebase Storage upload for images

**Required Changes:**
```typescript
// Load
const response = await apiClient.getPodcastEpisodes();

// Create
await apiClient.createPodcastEpisode({
  title: formData.title,
  publishDate: formData.publishDate.toISOString().split('T')[0],
  featured: formData.featured ? 1 : 0,
  ...
});

// Update
await apiClient.updatePodcastEpisode(id, data);

// Delete
await apiClient.deletePodcastEpisode(id);

// Upload Image
await apiClient.uploadPodcastImage(id, file);
```

### 3. admin/pages/Raffles.jsx (MEDIUM PRIORITY)

**Note:** This is a .jsx file, not TypeScript

**Current Firebase Operations:**
- CRUD operations for raffles
- Firebase Storage for images

**Required Changes:**
- Similar pattern to Events
- Use `apiClient.getRaffles()`, `createRaffle()`, etc.
- Handle raffle entries with `apiClient.getRaffleEntries(raffleId)`

### 4. admin/pages/SiteConfig.tsx (LOW PRIORITY)

**Current Firebase Operations:**
- Read/write to `siteConfig` collection

**Required Changes:**
```typescript
// Load config
const response = await apiClient.getSiteConfig();

// Get specific value
const response = await apiClient.getConfigValue('socialMedia');

// Set value
await apiClient.setConfigValue('socialMedia', JSON.stringify(data));
```

### 5. admin/pages/Login.tsx (HIGH PRIORITY)

**Current Firebase Operations:**
- `signInWithEmailAndPassword()` - Firebase Auth

**Required Changes:**
```typescript
// BEFORE
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';

const handleLogin = async () => {
  await signInWithEmailAndPassword(auth, email, password);
};

// AFTER
import { apiClient } from '@shared/api-client';

const handleLogin = async () => {
  const response = await apiClient.login(email, password);
  if (response.success && response.data) {
    // Token is automatically stored by apiClient
    // Redirect to dashboard
  }
};
```

### 6. admin/context/AuthContext.tsx (HIGH PRIORITY)

**Current Firebase Operations:**
- `onAuthStateChanged()` - Listen for auth state
- `signOut()` - Logout
- Firebase User object

**Required Changes:**
```typescript
// BEFORE
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase.config';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// AFTER
import { apiClient } from '@shared/api-client';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify token on mount
    const verifyAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        const response = await apiClient.verifyToken();
        if (response.success) {
          setUser(response.data);
        } else {
          apiClient.setToken(null);
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

### 7. admin/components/ImageUpload.tsx (MEDIUM PRIORITY)

**Current Firebase Operations:**
- Firebase Storage uploads

**Required Changes:**
```typescript
// BEFORE
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase.config';

const handleUpload = async (file, resourceId, resourceType) => {
  const storageRef = ref(storage, `${resourceType}/${resourceId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// AFTER
import { apiClient } from '@shared/api-client';

const handleUpload = async (file, resourceId, resourceType) => {
  let response;
  if (resourceType === 'events') {
    response = await apiClient.uploadEventImage(resourceId, file);
  } else if (resourceType === 'podcast') {
    response = await apiClient.uploadPodcastImage(resourceId, file);
  } else if (resourceType === 'raffles') {
    response = await apiClient.uploadRaffleImage(resourceId, file);
  }

  if (response.success) {
    return response.data.imageUrl;
  }
  throw new Error(response.error || 'Upload failed');
};
```

## Field Mapping Quick Reference

| Firebase/Form Field | API Field | Type Conversion |
|---------------------|-----------|-----------------|
| `name` | `title` | Direct |
| `eventDate` | `date` | Date → YYYY-MM-DD string |
| `eventTime` | `time` | Direct |
| `address` | `location` | Direct |
| `location` | `brewery` | Direct |
| `websiteUrl` | `externalUrl` | Direct |
| `ticketUrl` | `externalUrl` | Direct (merge) |
| `featured` | `featured` | boolean → 0 or 1 |
| `approved` | N/A | Remove (all API data is approved) |
| `publishDate` | `publishDate` | Date → YYYY-MM-DD string |

## Authentication Flow Change

### Before (Firebase Auth)
1. User enters credentials
2. Firebase validates and creates session
3. `onAuthStateChanged` fires
4. User object stored in context
5. Protected routes check user object

### After (JWT Auth)
1. User enters credentials
2. API validates and returns JWT token
3. Token stored in localStorage via apiClient
4. Token sent with each API request (Authorization header)
5. Protected routes check token validity

## Estimated Work Per File

| File | Complexity | Est. Time | Priority |
|------|------------|-----------|----------|
| Events.tsx | High | 2-3 hours | Critical |
| Podcast.tsx | High | 2-3 hours | Critical |
| Login.tsx | Medium | 1 hour | High |
| AuthContext.tsx | Medium | 1-2 hours | High |
| Raffles.jsx | Medium | 1-2 hours | Medium |
| ImageUpload.tsx | Low | 30-45 min | Medium |
| SiteConfig.tsx | Low | 30 min | Low |

**Total Estimated Time**: 8-12 hours

## Testing Checklist After Updates

- [ ] Admin login works with email/password
- [ ] Admin can view all events
- [ ] Admin can create new event
- [ ] Admin can edit existing event
- [ ] Admin can delete event
- [ ] Image upload works for events
- [ ] Same tests for Podcast episodes
- [ ] Same tests for Raffles
- [ ] Config values can be read/updated
- [ ] Logout works and clears token
- [ ] Protected routes redirect to login
- [ ] Token persists across page refreshes
- [ ] Expired tokens are handled correctly

## Next Steps

1. **Start with Authentication** (Login + AuthContext) - This unblocks all admin pages
2. **Update Events.tsx** - Most complex, handles all CRUD operations
3. **Update Podcast.tsx** - Similar pattern to Events
4. **Update remaining pages** - Smaller, can be done quickly
5. **Test thoroughly** - Each CRUD operation
6. **Build and deploy** - Fix any TypeScript errors

## Common Patterns

### Loading Data
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

const loadData = async () => {
  setLoading(true);
  const response = await apiClient.getSomething();
  if (response.success) {
    setData(response.data);
  } else {
    alert('Error: ' + response.error);
  }
  setLoading(false);
};
```

### Creating Item
```typescript
const handleCreate = async (formData) => {
  const response = await apiClient.createSomething({
    // Transform form data to API format
    title: formData.name,
    date: formData.eventDate.toISOString().split('T')[0],
    featured: formData.featured ? 1 : 0,
  });

  if (response.success) {
    // Reload list
    await loadData();
    // Close form
    setShowForm(false);
  } else {
    alert('Error: ' + response.error);
  }
};
```

### Updating Item
```typescript
const handleUpdate = async (id, formData) => {
  const response = await apiClient.updateSomething(id, transformedData);

  if (response.success) {
    await loadData();
  } else {
    alert('Error: ' + response.error);
  }
};
```

### Deleting Item
```typescript
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;

  const response = await apiClient.deleteSomething(id);

  if (response.success) {
    await loadData();
  } else {
    alert('Error: ' + response.error);
  }
};
```

## Status

🟡 **Admin Pages: 0% Complete**

All admin functionality requires authentication to work, so **Login + AuthContext should be prioritized first**.
