const admin = require('firebase-admin');

const serviceAccount = require('../brewedat-firebase-adminsdk-fbsvc-f6feca5395.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Helper functions
function getRandomBio() {
  const bios = [
    "Craft beer enthusiast exploring Philadelphia's brewery scene!",
    "Always on the hunt for the perfect IPA.",
    "Beer lover, brewery hopper, weekend warrior.",
    "Stout season is the best season.",
    "Living my best beer life, one pint at a time.",
    "Certified beer snob and proud of it.",
    "From pilsners to porters, I love them all!",
    "Brewery tours are my cardio.",
    "Beer is proof that God loves us and wants us to be happy.",
    "Hop head | Brewery explorer | Philly proud",
    "Sour beer convert - the funkier, the better!",
    "Life's too short for bad beer.",
    "Beer brings people together.",
    "Supporting local breweries since forever.",
    "Belgian beer enthusiast with a weakness for IPAs."
  ];
  return bios[Math.floor(Math.random() * bios.length)];
}

function getRandomBeerNote() {
  const notes = [
    "Great hoppy flavor with citrus notes!",
    "Smooth and creamy, perfect for a cold day.",
    "Nice balance between malt and hops.",
    "Refreshing and crisp, great summer beer.",
    "Bold flavors, definitely recommend!",
    "A bit too hoppy for my taste, but well-made.",
    "Excellent roasted malt character.",
    "Fruity and tart, very refreshing!",
    "Classic style done right.",
    "Notes of chocolate and coffee, delicious!",
    "Light and easy drinking.",
    "Complex flavor profile, lots of depth.",
    "Perfect beer for the season.",
    "One of my new favorites!",
    "Solid beer, would order again."
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

const testUsers = [
  { name: 'Sarah Johnson', email: 'sarah@test.com', beerPrefs: ['IPA', 'Stout'], age: 25, level: 8, points: 2450 },
  { name: 'Mike Chen', email: 'mike@test.com', beerPrefs: ['Pilsner', 'Lager'], age: 32, level: 5, points: 1200 },
  { name: 'Emily Rodriguez', email: 'emily@test.com', beerPrefs: ['Wheat', 'Sour'], age: 28, level: 12, points: 4800 },
  { name: 'David Kim', email: 'david@test.com', beerPrefs: ['IPA', 'Porter'], age: 35, level: 3, points: 650 },
  { name: 'Jessica Brown', email: 'jessica@test.com', beerPrefs: ['Ale', 'Stout'], age: 27, level: 7, points: 2100 },
  { name: 'Tom Wilson', email: 'tom@test.com', beerPrefs: ['Lager', 'Pilsner'], age: 41, level: 15, points: 6500 },
  { name: 'Rachel Green', email: 'rachel@test.com', beerPrefs: ['IPA', 'Wheat'], age: 29, level: 10, points: 3400 },
  { name: 'James Lee', email: 'james@test.com', beerPrefs: ['Porter', 'Stout'], age: 38, level: 6, points: 1750 },
  { name: 'Amanda White', email: 'amanda@test.com', beerPrefs: ['Sour', 'Ale'], age: 24, level: 2, points: 300 },
  { name: 'Chris Taylor', email: 'chris.t@test.com', beerPrefs: ['IPA', 'Lager'], age: 33, level: 9, points: 2900 },
  { name: 'Alex Martinez', email: 'alex@test.com', beerPrefs: ['Belgian', 'Wheat'], age: 30, level: 11, points: 3850 },
  { name: 'Nicole Davis', email: 'nicole@test.com', beerPrefs: ['Stout', 'Porter'], age: 26, level: 4, points: 890 },
  { name: 'Ryan Thompson', email: 'ryan@test.com', beerPrefs: ['IPA', 'Sour'], age: 34, level: 13, points: 5200 },
  { name: 'Lisa Anderson', email: 'lisa@test.com', beerPrefs: ['Pilsner', 'Wheat'], age: 31, level: 8, points: 2600 },
  { name: 'Kevin Park', email: 'kevin@test.com', beerPrefs: ['Porter', 'Belgian'], age: 29, level: 6, points: 1580 }
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
        totalPoints: userData.points || Math.floor(Math.random() * 1000),
        level: userData.level || Math.floor(Math.random() * 5) + 1,
        achievements: [],
        totalCheckIns: 0,
        uniqueBreweries: 0,
        favoriteBrewery: null,
        memberSince: admin.firestore.Timestamp.fromMillis(
          Date.now() - (Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
        ),
        lastActive: admin.firestore.Timestamp.now(),
        profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=D4922A&color=fff`,
        bio: getRandomBio(),
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
  const beerStyles = ['IPA', 'Stout', 'Porter', 'Lager', 'Pilsner', 'Wheat', 'Sour', 'Belgian', 'Pale Ale', 'Amber'];
  const beerNames = [
    'Hop Devil', 'Golden Monkey', 'Prima Pils', 'Storm King', 'Dirtwolf',
    'Sour Monkey', 'Twisted Monkey', 'Mad Elf', 'Vital IPA', 'Local Legend'
  ];

  for (const user of createdUsers) {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userLevel = userDoc.data().level || 1;
    // More check-ins for higher level users
    const numCheckins = Math.floor(userLevel * 2 + Math.random() * 10);
    const userBreweries = new Set();
    const checkinData = [];

    for (let i = 0; i < numCheckins; i++) {
      const randomBrewery = breweryIds[Math.floor(Math.random() * breweryIds.length)];
      const breweryDoc = await db.collection('events').doc(randomBrewery).get();
      const breweryData = breweryDoc.data();
      userBreweries.add(randomBrewery);

      const daysAgo = Math.floor(Math.random() * 180); // Up to 6 months of history
      const timestamp = admin.firestore.Timestamp.fromMillis(
        Date.now() - (daysAgo * 24 * 60 * 60 * 1000)
      );

      const beerStyle = beerStyles[Math.floor(Math.random() * beerStyles.length)];
      const beerName = beerNames[Math.floor(Math.random() * beerNames.length)];
      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars

      const checkin = {
        userId: user.uid,
        userName: user.name,
        breweryId: randomBrewery,
        breweryName: breweryData.name,
        beerName: beerName,
        beerStyle: beerStyle,
        rating: rating,
        notes: Math.random() > 0.5 ? getRandomBeerNote() : null,
        points: breweryData.pointsReward,
        method: Math.random() > 0.7 ? 'qr' : 'location',
        timestamp: timestamp,
        likes: Math.floor(Math.random() * 15),
        photoUrl: Math.random() > 0.7 ? `https://source.unsplash.com/400x400/?beer,brewery&sig=${Math.random()}` : null
      };

      await db.collection('checkins').add(checkin);
      checkinData.push(checkin);
      totalCheckins++;
    }

    // Find favorite brewery (most visited)
    const breweryVisits = {};
    checkinData.forEach(checkin => {
      breweryVisits[checkin.breweryId] = (breweryVisits[checkin.breweryId] || 0) + 1;
    });
    const favoriteBrewery = Object.keys(breweryVisits).reduce((a, b) =>
      breweryVisits[a] > breweryVisits[b] ? a : b
    , null);

    // Update user stats
    await db.collection('users').doc(user.uid).update({
      totalCheckIns: numCheckins,
      uniqueBreweries: userBreweries.size,
      favoriteBrewery: favoriteBrewery
    });
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
  const allAchievements = [
    { id: 'first_checkin', name: 'First Check-in', description: 'Check in at your first brewery', icon: 'beer', points: 50 },
    { id: 'style_explorer', name: 'Style Explorer', description: 'Try 5 different beer styles', icon: 'compass', points: 100 },
    { id: 'social_butterfly', name: 'Social Butterfly', description: 'Check in with 10 different friends', icon: 'account-multiple', points: 150 },
    { id: 'beer_connoisseur', name: 'Beer Connoisseur', description: 'Rate 20 different beers', icon: 'star', points: 200 },
    { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Check in 5 weekends in a row', icon: 'calendar-weekend', points: 100 },
    { id: 'loyal_patron', name: 'Loyal Patron', description: 'Visit the same brewery 10 times', icon: 'heart', points: 250 },
    { id: 'early_bird', name: 'Early Bird', description: 'Check in before noon', icon: 'weather-sunset-up', points: 75 },
    { id: 'night_owl', name: 'Night Owl', description: 'Check in after 10 PM', icon: 'weather-night', points: 75 },
    { id: 'brewery_hopper', name: 'Brewery Hopper', description: 'Visit 3 breweries in one day', icon: 'map-marker-multiple', points: 200 },
    { id: 'level_10', name: 'Double Digits', description: 'Reach level 10', icon: 'numeric-10', points: 500 },
    { id: 'centurion', name: 'Centurion', description: '100 total check-ins', icon: 'trophy', points: 1000 },
    { id: 'philadelphia_pride', name: 'Philadelphia Pride', description: 'Visit all Philadelphia breweries', icon: 'city', points: 500 }
  ];

  for (const user of createdUsers) {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const userLevel = userData.level || 1;

    // More achievements for higher level users
    const maxAchievements = Math.min(userLevel, 8);
    const numAchievements = Math.floor(Math.random() * (maxAchievements / 2)) + Math.floor(maxAchievements / 2);

    const userAchievements = allAchievements
      .sort(() => Math.random() - 0.5)
      .slice(0, numAchievements)
      .map(achievement => ({
        ...achievement,
        unlockedAt: admin.firestore.Timestamp.fromMillis(
          Date.now() - (Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000)
        )
      }));

    await db.collection('users').doc(user.uid).update({
      achievements: userAchievements
    });
  }
  console.log(`  ✓ Assigned random achievements to users`);

  console.log('\n✅ TEST DATA POPULATED!\n');
  console.log(`Created:`);
  console.log(`  - ${createdUsers.length} users with profiles, bios, and avatars`);
  console.log(`  - ${breweryIds.length} breweries`);
  console.log(`  - ${totalCheckins} check-ins with beer details and ratings`);
  console.log(`  - ${raffleIds.length} raffles`);
  console.log(`  - ${totalEntries} raffle entries`);
  console.log(`\nUser Features:`);
  console.log(`  - Levels ranging from 1-15`);
  console.log(`  - Points ranging from 300-6500`);
  console.log(`  - Achievement badges with icons and unlock dates`);
  console.log(`  - Check-in history with beer names, styles, ratings, and notes`);
  console.log(`  - Favorite breweries based on visit frequency`);
  console.log(`  - Profile pictures and bios`);
  console.log(`\nTest user credentials: email / password = test123456\n`);

  process.exit(0);
}

populateTestData().catch(console.error);