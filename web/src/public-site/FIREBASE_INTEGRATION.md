# Firebase Integration Documentation

## Overview
The BrewedAt website is now connected to the Firebase backend, allowing for dynamic event management through the admin dashboard.

## What Was Implemented

### 1. Firebase Configuration
- **File**: `firebase.config.js`
- Configured Firebase Web SDK with Firestore and Storage
- Uses the same Firebase project as the admin dashboard (`brewedat`)

### 2. Events Page (`events.html`)
- **File**: `events.js`
- Dynamically loads events from Firestore `events` collection
- Separates events into two categories:
  - **BrewedAt Events**: Events with `eventType === 'brewedat'`
  - **Local Events**: All other approved events
- Only displays approved events (`approved !== false` and `status !== 'pending'`)
- Sorts events by date (upcoming first)
- Real-time loading with loading states and error handling

### 3. Event Submission Form (`submit-event.html`)
- **File**: `submit-event.js`
- Saves event submissions directly to Firestore
- Uploads event images/flyers to Firebase Storage
- Submitted events are marked as:
  - `status: 'pending'`
  - `approved: false`
  - `eventType: 'local'`
- Includes submitter information for admin review

### 4. Firestore Security Rules
- **File**: `firestore.rules`
- Public read access to events (for website display)
- Public create access to events (for submissions)
- Only admins can update/delete events
- Events are approved through the admin dashboard

## Event Data Structure

### Event Document in Firestore
```javascript
{
  name: "Event Name",
  description: "Event description",
  eventDate: Timestamp,
  eventTime: "19:00",
  address: "123 Main St, Philadelphia, PA",
  location: "Venue Name",
  websiteUrl: "https://example.com",
  imageUrl: "https://storage.googleapis.com/...",
  eventType: "brewedat" | "local",
  status: "active" | "pending",
  approved: true | false,
  submittedBy: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com"
  },
  createdAt: Timestamp
}
```

## Admin Dashboard Workflow

### Reviewing Submissions
1. Admin logs into dashboard at `/admin-dashboard`
2. Can view all events including pending submissions
3. Can approve events by:
   - Setting `approved: true`
   - Changing `status` from `pending` to `active`
4. Can edit event details (name, description, date, etc.)
5. Can delete spam or inappropriate submissions

### Creating BrewedAt Events
Admins can create official BrewedAt events directly in the dashboard by setting:
- `eventType: 'brewedat'`
- `approved: true`
- `status: 'active'`

## File Upload
Event images and flyers are stored in Firebase Storage at:
```
event-submissions/{timestamp}_{filename}
```

## Dependencies
- `firebase` (v10+) - Installed via npm
- Firestore for database
- Firebase Storage for file uploads

## Testing
1. Visit `/events.html` to see dynamically loaded events
2. Visit `/submit-event.html` to submit a new event
3. Check Firebase Console to verify event was created
4. Use admin dashboard to approve the event
5. Refresh `/events.html` to see the approved event appear

## Notes
- Events without `approved` field are considered approved (for backward compatibility with existing data)
- Public event submissions require admin approval before appearing on the website
- The system gracefully handles missing data with fallback values
- All Firebase operations include error handling and user feedback
