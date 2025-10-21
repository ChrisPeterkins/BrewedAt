# BrewedAt Admin Scripts

Collection of Node.js scripts for managing the BrewedAt app data.

## Prerequisites

All scripts require the Firebase Admin SDK service account key to be present in the project root:
- `brewedat-firebase-adminsdk-fbsvc-f6feca5395.json`

## Available Scripts

### Data Management

#### `clearData.js`
Clears all non-admin data from the database while preserving admin accounts.

```bash
node scripts/clearData.js
```

**What it does:**
- Deletes all non-admin users
- Deletes all check-ins
- Deletes all raffle entries
- Deletes all raffles
- Resets admin user stats (points, level, achievements) but keeps admin status

**What it preserves:**
- Admin users (any user with `isAdmin: true`)
- Events/breweries collection

---

#### `populateTestData.js`
Populates the database with realistic test data.

```bash
node scripts/populateTestData.js
```

**What it creates:**
- 10 test users with realistic names and profiles
- 8 Philadelphia breweries
- 20-100 random check-ins (distributed across users)
- 3 active raffles with different prize values
- 20-50 raffle entries (distributed across users and raffles)
- Random achievements assigned to users

**Test user credentials:**
- Email: `<name>@test.com` (e.g., `sarah@test.com`)
- Password: `test123456`

---

### Utility Scripts

#### `checkRaffleEntries.js`
Displays all raffles and their entrants with detailed information.

```bash
node scripts/checkRaffleEntries.js
```

**Output includes:**
- Raffle name, status, and end date
- Total entries (field vs actual count)
- List of all entrants with names and entry counts

---

#### `checkUser.js`
View user data from Firestore.

```bash
# List all users
node scripts/checkUser.js

# View specific user
node scripts/checkUser.js <userId>
```

---

#### `fixRaffleCounts.js`
Recalculates and updates the `totalEntries` field for all raffles based on actual entries in the database.

```bash
node scripts/fixRaffleCounts.js
```

Use this if raffle entry counts get out of sync.

---

## Common Workflows

### Reset and Repopulate Database
```bash
# Clear all test data (keeps admins)
node scripts/clearData.js

# Add fresh test data
node scripts/populateTestData.js

# Verify data
node scripts/checkRaffleEntries.js
```

### Check Data Status
```bash
# View all users
node scripts/checkUser.js

# View raffle entries
node scripts/checkRaffleEntries.js
```

### Fix Data Issues
```bash
# Fix raffle entry counts
node scripts/fixRaffleCounts.js
```

---

## Notes

- All scripts use Firebase Admin SDK with full database access
- Scripts are safe to run multiple times (except `populateTestData.js` which may create duplicates)
- Always test scripts in a development environment first
- The service account key file is git-ignored for security