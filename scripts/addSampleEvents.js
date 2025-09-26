// Run this script once to add sample brewery events to Firestore
// Usage: node scripts/addSampleEvents.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCJTDteoLsgqUevqV_1WHg3XdjOTAaJu4o",
  authDomain: "brewedat.firebaseapp.com",
  projectId: "brewedat",
  storageBucket: "brewedat.firebasestorage.app",
  messagingSenderId: "264641983823",
  appId: "1:264641983823:web:27782317ef0dd8bf5f813a",
  measurementId: "G-81P591DG9M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleEvents = [
  {
    name: "Victory Brewing Company",
    description: "Craft brewery with a wide selection of IPAs and seasonal brews",
    address: "420 Acorn Ln, Downingtown, PA 19335",
    coordinates: {
      latitude: 40.0065,
      longitude: -75.7033
    },
    eventType: "brewery",
    isActive: true,
    pointsReward: 10,
    styles: ["IPA", "Lager", "Stout"],
    createdAt: new Date().toISOString()
  },
  {
    name: "Yards Brewing Company",
    description: "Philadelphia's original craft brewery since 1994",
    address: "500 Spring Garden St, Philadelphia, PA 19123",
    coordinates: {
      latitude: 39.9617,
      longitude: -75.1522
    },
    eventType: "brewery",
    isActive: true,
    pointsReward: 10,
    styles: ["Pale Ale", "IPA", "Lager"],
    createdAt: new Date().toISOString()
  },
  {
    name: "Two Locals Brewing",
    description: "Pennsylvania's first Black-owned brewery with unique flavors",
    address: "1290 E Hortter St, Philadelphia, PA 19150",
    coordinates: {
      latitude: 40.0595,
      longitude: -75.1627
    },
    eventType: "brewery",
    isActive: true,
    pointsReward: 15,
    styles: ["IPA", "Sour", "Wheat Beer"],
    createdAt: new Date().toISOString()
  },
  {
    name: "Evil Genius Beer Company",
    description: "Experimental brews and inventive flavors",
    address: "1727 N Front St, Philadelphia, PA 19122",
    coordinates: {
      latitude: 39.9785,
      longitude: -75.1337
    },
    eventType: "brewery",
    isActive: true,
    pointsReward: 10,
    styles: ["IPA", "Stout", "Sour"],
    createdAt: new Date().toISOString()
  },
  {
    name: "Love City Brewing Company",
    description: "Philadelphia neighborhood brewery with local vibes",
    address: "1023 Hamilton St, Philadelphia, PA 19123",
    coordinates: {
      latitude: 39.9627,
      longitude: -75.1515
    },
    eventType: "brewery",
    isActive: true,
    pointsReward: 10,
    styles: ["Lager", "IPA", "Pilsner"],
    createdAt: new Date().toISOString()
  }
];

async function addSampleEvents() {
  console.log('Adding sample events to Firestore...');

  try {
    for (const event of sampleEvents) {
      const docRef = await addDoc(collection(db, 'events'), event);
      console.log(`✓ Added: ${event.name} (ID: ${docRef.id})`);
    }

    console.log('\n✅ Successfully added all sample events!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding events:', error);
    process.exit(1);
  }
}

addSampleEvents();