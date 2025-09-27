const admin = require('firebase-admin');

const serviceAccount = require('../brewedat-firebase-adminsdk-fbsvc-f6feca5395.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const testUsers = [
  { name: 'Sarah Johnson', email: 'sarah@test.com', beerPrefs: ['IPA', 'Stout'], age: 25 },
  { name: 'Mike Chen', email: 'mike@test.com', beerPrefs: ['Pilsner', 'Lager'], age: 32 },
  { name: 'Emily Rodriguez', email: 'emily@test.com', beerPrefs: ['Wheat', 'Sour'], age: 28 },
  { name: 'David Kim', email: 'david@test.com', beerPrefs: ['IPA', 'Porter'], age: 35 },
  { name: 'Jessica Brown', email: 'jessica@test.com', beerPrefs: ['Ale', 'Stout'], age: 27 },
  { name: 'Tom Wilson', email: 'tom@test.com', beerPrefs: ['Lager', 'Pilsner'], age: 41 },
  { name: 'Rachel Green', email: 'rachel@test.com', beerPrefs: ['IPA', 'Wheat'], age: 29 },
  { name: 'James Lee', email: 'james@test.com', beerPrefs: ['Porter', 'Stout'], age: 38 },
  { name: 'Amanda White', email: 'amanda@test.com', beerPrefs: ['Sour', 'Ale'], age: 24 },
  { name: 'Chris Taylor', email: 'chris.t@test.com', beerPrefs: ['IPA', 'Lager'], age: 33 }
];

const phillyBreweries = [
  {
    name: 'Victory Brewing Company',
    address: '144 W Chelten Ave, Philadelphia, PA',
    coordinates: { latitude: 40.0348, longitude: -75.1804 },
    pointsReward: 50
  },
  {
    name: 'Yards Brewing Company',
    address: '500 Spring Garden St, Philadelphia, PA',
    coordinates: { latitude: 39.9615, longitude: -75.1490 },
    pointsReward: 50
  },
  {
    name: 'Evil Genius Beer Company',
    address: '1727 N Front St, Philadelphia, PA',
    coordinates: { latitude: 39.9779, longitude: -75.1334 },
    pointsReward: 50
  },
  {
    name: 'Love City Brewing',
    address: '1023 Hamilton St, Philadelphia, PA',
    coordinates: { latitude: 39.9589, longitude: -75.1544 },
    pointsReward: 50
  },
  {
    name: 'Philadelphia Brewing Company',
    address: '2440 Frankford Ave, Philadelphia, PA',
    coordinates: { latitude: 39.9780, longitude: -75.1265 },
    pointsReward: 50
  },
  {
    name: 'Dock Street Brewery',
    address: '701 S 50th St, Philadelphia, PA',
    coordinates: { latitude: 39.9435, longitude: -75.2195 },
    pointsReward: 50
  },
  {
    name: 'Second District Brewing',
    address: '1939 Fairmount Ave, Philadelphia, PA',
    coordinates: { latitude: 39.9677, longitude: -75.1724 },
    pointsReward: 50
  },
  {
    name: 'Crime & Punishment Brewing',
    address: '2711 W Girard Ave, Philadelphia, PA',
    coordinates: { latitude: 39.9727, longitude: -75.1825 },
    pointsReward: 50
  }
];

const raffles = [
  {
    prizeName: '$100 Gift Card to Victory Brewing',
    description: 'Enjoy a $100 gift card to Victory Brewing Company. Perfect for a brewery tour or stocking up on your favorite brews!',
    costPerEntry: 100,
    maxEntriesPerUser: 10,
    daysUntilEnd: 7
  },
  {
    prizeName: 'VIP Brewery Tour for 4',
    description: 'Get an exclusive behind-the-scenes VIP tour at Philadelphia Brewing Company for you and 3 friends!',
    costPerEntry: 150,
    maxEntriesPerUser: 5,
    daysUntilEnd: 14
  },
  {
    prizeName: 'Craft Beer Tasting Kit',
    description: 'A curated selection of 12 craft beers from Philadelphia breweries, delivered to your door.',
    costPerEntry: 50,
    maxEntriesPerUser: 20,
    daysUntilEnd: 5
  }
];

async function populateTestData() {
  console.log('\n=== POPULATING TEST DATA ===\n');

  // Create test users
  console.log('Creating test users...');
  const createdUsers = [];

  for (const userData of testUsers) {
    try {
      // Create Firebase Auth user
      const userRecord = await auth.createUser({
        email: userData.email,
        password: 'test123456',
        displayName: userData.name
      });

      // Create Firestore user document
      await db.collection('users').doc(userRecord.uid).set({
        name: userData.name,
        email: userData.email,
        birthdate: `199${Math.floor(Math.random() * 10)}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
        age: userData.age,
        beerPreferences: userData.beerPrefs,
        totalPoints: Math.floor(Math.random() * 500),
        level: Math.floor(Math.random() * 5) + 1,
        achievements: [],
        createdAt: new Date().toISOString()
      });

      createdUsers.push({ uid: userRecord.uid, name: userData.name });
      console.log(`  ✓ Created ${userData.name}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`  ⚠ ${userData.email} already exists, skipping...`);
      } else {
        console.error(`  ✗ Error creating ${userData.name}:`, error.message);
      }
    }
  }

  // Add breweries/events
  console.log('\nAdding breweries...');
  const breweryIds = [];
  for (const brewery of phillyBreweries) {
    const docRef = await db.collection('events').add(brewery);
    breweryIds.push(docRef.id);
    console.log(`  ✓ Added ${brewery.name}`);
  }

  // Create check-ins
  console.log('\nCreating random check-ins...');
  let totalCheckins = 0;
  for (const user of createdUsers) {
    const numCheckins = Math.floor(Math.random() * 8) + 2; // 2-10 check-ins per user

    for (let i = 0; i < numCheckins; i++) {
      const randomBrewery = breweryIds[Math.floor(Math.random() * breweryIds.length)];
      const breweryDoc = await db.collection('events').doc(randomBrewery).get();
      const breweryData = breweryDoc.data();

      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = admin.firestore.Timestamp.fromMillis(
        Date.now() - (daysAgo * 24 * 60 * 60 * 1000)
      );

      await db.collection('checkins').add({
        userId: user.uid,
        breweryId: randomBrewery,
        breweryName: breweryData.name,
        points: breweryData.pointsReward,
        method: Math.random() > 0.7 ? 'qr' : 'location',
        timestamp: timestamp
      });

      totalCheckins++;
    }
  }
  console.log(`  ✓ Created ${totalCheckins} check-ins`);

  // Create raffles
  console.log('\nCreating raffles...');
  const raffleIds = [];
  for (const raffle of raffles) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + raffle.daysUntilEnd);

    const docRef = await db.collection('raffles').add({
      prizeName: raffle.prizeName,
      description: raffle.description,
      costPerEntry: raffle.costPerEntry,
      maxEntriesPerUser: raffle.maxEntriesPerUser,
      endDate: admin.firestore.Timestamp.fromDate(endDate),
      status: 'active',
      totalEntries: 0,
      createdAt: admin.firestore.Timestamp.now()
    });

    raffleIds.push(docRef.id);
    console.log(`  ✓ Created "${raffle.prizeName}"`);
  }

  // Add raffle entries
  console.log('\nAdding raffle entries...');
  let totalEntries = 0;
  for (const raffle of raffleIds) {
    const numEntrants = Math.floor(Math.random() * 6) + 3; // 3-8 entrants per raffle
    const selectedUsers = createdUsers
      .sort(() => Math.random() - 0.5)
      .slice(0, numEntrants);

    for (const user of selectedUsers) {
      const numEntries = Math.floor(Math.random() * 3) + 1; // 1-3 entries per user

      await db.collection('raffleEntries').add({
        raffleId: raffle,
        userId: user.uid,
        entriesCount: numEntries,
        timestamp: admin.firestore.Timestamp.now()
      });

      await db.collection('raffles').doc(raffle).update({
        totalEntries: admin.firestore.FieldValue.increment(numEntries)
      });

      totalEntries += numEntries;
    }
  }
  console.log(`  ✓ Created ${totalEntries} raffle entries`);

  // Assign random achievements
  console.log('\nAssigning achievements...');
  const allAchievements = ['first_checkin', 'style_explorer', 'social_butterfly', 'beer_connoisseur', 'weekend_warrior', 'loyal_patron'];

  for (const user of createdUsers) {
    const numAchievements = Math.floor(Math.random() * 4); // 0-3 achievements
    const userAchievements = allAchievements
      .sort(() => Math.random() - 0.5)
      .slice(0, numAchievements);

    await db.collection('users').doc(user.uid).update({
      achievements: userAchievements
    });
  }
  console.log(`  ✓ Assigned random achievements to users`);

  console.log('\n✅ TEST DATA POPULATED!\n');
  console.log(`Created:`);
  console.log(`  - ${createdUsers.length} users`);
  console.log(`  - ${breweryIds.length} breweries`);
  console.log(`  - ${totalCheckins} check-ins`);
  console.log(`  - ${raffleIds.length} raffles`);
  console.log(`  - ${totalEntries} raffle entries`);
  console.log(`\nTest user credentials: email / password = test123456\n`);

  process.exit(0);
}

populateTestData().catch(console.error);