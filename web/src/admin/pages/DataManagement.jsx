import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, writeBatch, Timestamp, increment, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase.config';

export default function DataManagement() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [socialStats, setSocialStats] = useState({
    instagram: { handle: 'brewedat', followers: 0 },
    facebook: { handle: 'brewedat', followers: 0 },
    twitter: { handle: 'brewedat', followers: 0 },
    youtube: { handle: '@brewedat', subscribers: 0 }
  });
  const [savingSocial, setSavingSocial] = useState(false);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
    console.log(message);
  };

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
    { name: 'Victory Brewing Company', address: '144 W Chelten Ave, Philadelphia, PA', coordinates: { latitude: 40.0348, longitude: -75.1804 }, pointsReward: 50 },
    { name: 'Yards Brewing Company', address: '500 Spring Garden St, Philadelphia, PA', coordinates: { latitude: 39.9615, longitude: -75.1490 }, pointsReward: 50 },
    { name: 'Evil Genius Beer Company', address: '1727 N Front St, Philadelphia, PA', coordinates: { latitude: 39.9779, longitude: -75.1334 }, pointsReward: 50 },
    { name: 'Love City Brewing', address: '1023 Hamilton St, Philadelphia, PA', coordinates: { latitude: 39.9589, longitude: -75.1544 }, pointsReward: 50 },
    { name: 'Philadelphia Brewing Company', address: '2440 Frankford Ave, Philadelphia, PA', coordinates: { latitude: 39.9780, longitude: -75.1265 }, pointsReward: 50 },
    { name: 'Dock Street Brewery', address: '701 S 50th St, Philadelphia, PA', coordinates: { latitude: 39.9435, longitude: -75.2195 }, pointsReward: 50 },
    { name: 'Second District Brewing', address: '1939 Fairmount Ave, Philadelphia, PA', coordinates: { latitude: 39.9677, longitude: -75.1724 }, pointsReward: 50 },
    { name: 'Crime & Punishment Brewing', address: '2711 W Girard Ave, Philadelphia, PA', coordinates: { latitude: 39.9727, longitude: -75.1825 }, pointsReward: 50 }
  ];

  const raffles = [
    { prizeName: '$100 Gift Card to Victory Brewing', description: 'Enjoy a $100 gift card to Victory Brewing Company. Perfect for a brewery tour or stocking up on your favorite brews!', costPerEntry: 100, maxEntriesPerUser: 10, daysUntilEnd: 7 },
    { prizeName: 'VIP Brewery Tour for 4', description: 'Get an exclusive behind-the-scenes VIP tour at Philadelphia Brewing Company for you and 3 friends!', costPerEntry: 150, maxEntriesPerUser: 5, daysUntilEnd: 14 },
    { prizeName: 'Craft Beer Tasting Kit', description: 'A curated selection of 12 craft beers from Philadelphia breweries, delivered to your door.', costPerEntry: 50, maxEntriesPerUser: 20, daysUntilEnd: 5 }
  ];

  const handleClearData = async () => {
    if (!confirm('⚠️ WARNING: This will delete all non-admin data (users, check-ins, raffles, entries). Admin accounts will be preserved but their stats will reset. Continue?')) {
      return;
    }

    setLoading(true);
    setLogs([]);
    addLog('Starting data clear...', 'info');

    try {
      // Find admin users
      addLog('Finding admin users...');
      const adminUsers = [];
      const usersSnapshot = await getDocs(collection(db, 'users'));

      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.isAdmin === true) {
          adminUsers.push(doc.id);
          addLog(`  Preserving admin: ${data.name || data.displayName || doc.id}`);
        }
      });

      // Delete non-admin users (client SDK can't delete auth users, only Firestore docs)
      addLog('Deleting non-admin user documents...');
      let deletedUsers = 0;
      for (const doc of usersSnapshot.docs) {
        if (!adminUsers.includes(doc.id)) {
          await deleteDoc(doc.ref);
          deletedUsers++;
        }
      }
      addLog(`  Deleted ${deletedUsers} user documents`, 'success');

      // Clear check-ins
      addLog('Deleting check-ins...');
      const checkinsSnapshot = await getDocs(collection(db, 'checkins'));
      const batch1 = writeBatch(db);
      checkinsSnapshot.docs.forEach(doc => batch1.delete(doc.ref));
      await batch1.commit();
      addLog(`  Deleted ${checkinsSnapshot.docs.length} check-ins`, 'success');

      // Clear raffle entries
      addLog('Deleting raffle entries...');
      const entriesSnapshot = await getDocs(collection(db, 'raffleEntries'));
      const batch2 = writeBatch(db);
      entriesSnapshot.docs.forEach(doc => batch2.delete(doc.ref));
      await batch2.commit();
      addLog(`  Deleted ${entriesSnapshot.docs.length} raffle entries`, 'success');

      // Delete raffles
      addLog('Deleting raffles...');
      const rafflesSnapshot = await getDocs(collection(db, 'raffles'));
      const batch3 = writeBatch(db);
      rafflesSnapshot.docs.forEach(doc => batch3.delete(doc.ref));
      await batch3.commit();
      addLog(`  Deleted ${rafflesSnapshot.docs.length} raffles`, 'success');

      // Reset admin stats
      addLog('Resetting admin user stats...');
      for (const adminId of adminUsers) {
        await updateDoc(doc(db, 'users', adminId), {
          totalPoints: 0,
          level: 1,
          achievements: []
        });
      }
      addLog(`  Reset ${adminUsers.length} admin users`, 'success');

      addLog('✅ Data cleared successfully!', 'success');
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateData = async () => {
    if (!confirm('This will add test data (users, breweries, check-ins, raffles). Continue?')) {
      return;
    }

    setLoading(true);
    setLogs([]);
    addLog('Starting data population...', 'info');

    try {
      // Note: We can't create Firebase Auth users from client SDK
      // So we'll just create Firestore user documents with fake IDs
      addLog('Creating test user documents...');
      const createdUsers = [];

      for (const userData of testUsers) {
        const fakeUid = `test_${userData.email.replace('@test.com', '')}`;

        await addDoc(collection(db, 'users'), {
          name: userData.name,
          email: userData.email,
          birthdate: `199${Math.floor(Math.random() * 10)}-0${Math.floor(Math.random() * 9) + 1}-${Math.floor(Math.random() * 28) + 1}`,
          age: userData.age,
          beerPreferences: userData.beerPrefs,
          totalPoints: Math.floor(Math.random() * 500),
          level: Math.floor(Math.random() * 5) + 1,
          achievements: [],
          createdAt: new Date().toISOString()
        }).then(docRef => {
          createdUsers.push({ uid: docRef.id, name: userData.name });
        });
      }
      addLog(`  Created ${createdUsers.length} users`, 'success');

      // Add breweries
      addLog('Adding breweries...');
      const breweryIds = [];
      for (const brewery of phillyBreweries) {
        const docRef = await addDoc(collection(db, 'events'), brewery);
        breweryIds.push(docRef.id);
      }
      addLog(`  Added ${breweryIds.length} breweries`, 'success');

      // Create check-ins
      addLog('Creating check-ins...');
      let totalCheckins = 0;
      for (const user of createdUsers) {
        const numCheckins = Math.floor(Math.random() * 8) + 2;

        for (let i = 0; i < numCheckins; i++) {
          const randomBreweryId = breweryIds[Math.floor(Math.random() * breweryIds.length)];
          const breweryDoc = await getDocs(collection(db, 'events'));
          const brewery = breweryDoc.docs.find(d => d.id === randomBreweryId);

          if (brewery) {
            const daysAgo = Math.floor(Math.random() * 30);
            const timestamp = Timestamp.fromMillis(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));

            await addDoc(collection(db, 'checkins'), {
              userId: user.uid,
              breweryId: randomBreweryId,
              breweryName: brewery.data().name,
              points: brewery.data().pointsReward,
              method: Math.random() > 0.7 ? 'qr' : 'location',
              timestamp: timestamp
            });
            totalCheckins++;
          }
        }
      }
      addLog(`  Created ${totalCheckins} check-ins`, 'success');

      // Create raffles
      addLog('Creating raffles...');
      const raffleIds = [];
      for (const raffle of raffles) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + raffle.daysUntilEnd);

        const docRef = await addDoc(collection(db, 'raffles'), {
          prizeName: raffle.prizeName,
          description: raffle.description,
          costPerEntry: raffle.costPerEntry,
          maxEntriesPerUser: raffle.maxEntriesPerUser,
          endDate: Timestamp.fromDate(endDate),
          status: 'active',
          totalEntries: 0,
          createdAt: Timestamp.now()
        });
        raffleIds.push(docRef.id);
      }
      addLog(`  Created ${raffleIds.length} raffles`, 'success');

      // Add raffle entries
      addLog('Adding raffle entries...');
      let totalEntries = 0;
      for (const raffleId of raffleIds) {
        const numEntrants = Math.floor(Math.random() * 6) + 3;
        const selectedUsers = createdUsers
          .sort(() => Math.random() - 0.5)
          .slice(0, numEntrants);

        for (const user of selectedUsers) {
          const numEntries = Math.floor(Math.random() * 3) + 1;

          await addDoc(collection(db, 'raffleEntries'), {
            raffleId: raffleId,
            userId: user.uid,
            entriesCount: numEntries,
            timestamp: Timestamp.now()
          });

          await updateDoc(doc(db, 'raffles', raffleId), {
            totalEntries: increment(numEntries)
          });

          totalEntries += numEntries;
        }
      }
      addLog(`  Created ${totalEntries} raffle entries`, 'success');

      addLog('✅ Test data populated successfully!', 'success');
      addLog(`Note: Test users are Firestore-only (not in Firebase Auth)`, 'info');
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFixRaffleCounts = async () => {
    setLoading(true);
    setLogs([]);
    addLog('Fixing raffle counts...', 'info');

    try {
      const rafflesSnapshot = await getDocs(collection(db, 'raffles'));

      for (const raffleDoc of rafflesSnapshot.docs) {
        const entriesSnapshot = await getDocs(collection(db, 'raffleEntries'));

        const totalEntries = entriesSnapshot.docs
          .filter(d => d.data().raffleId === raffleDoc.id)
          .reduce((sum, d) => sum + d.data().entriesCount, 0);

        await updateDoc(raffleDoc.ref, { totalEntries });
        addLog(`  Updated ${raffleDoc.data().prizeName}: ${totalEntries} entries`);
      }

      addLog('✅ Raffle counts fixed!', 'success');
    } catch (error) {
      addLog(`❌ Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load social media stats on component mount
  useEffect(() => {
    const loadSocialStats = async () => {
      try {
        const docRef = doc(db, 'siteConfig', 'socialMedia');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSocialStats(docSnap.data());
        }
      } catch (error) {
        console.error('Error loading social stats:', error);
      }
    };

    loadSocialStats();
  }, []);

  const handleSaveSocialStats = async () => {
    setSavingSocial(true);
    try {
      const docRef = doc(db, 'siteConfig', 'socialMedia');
      await setDoc(docRef, socialStats);
      alert('✅ Social media stats saved successfully!');
    } catch (error) {
      console.error('Error saving social stats:', error);
      alert('❌ Error saving stats: ' + error.message);
    } finally {
      setSavingSocial(false);
    }
  };

  const updateSocialStat = (platform, field, value) => {
    setSocialStats(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: field === 'followers' || field === 'subscribers' ? parseInt(value) || 0 : value
      }
    }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ margin: '0 0 8px 0', color: '#654321' }}>Data Management</h1>
      <p style={{ color: '#8B4513', marginBottom: '32px' }}>
        Tools for managing test data and database operations
      </p>

      {/* Social Media Stats Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <h2 style={{ marginTop: 0, color: '#654321' }}>📱 Social Media Stats</h2>
        <p style={{ color: '#8B4513', fontSize: '14px', marginBottom: '24px' }}>
          Update follower counts for the website. Changes will appear on the homepage after saving.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {/* Instagram */}
          <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0, color: '#654321', fontSize: '16px' }}>Instagram</h4>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8B4513' }}>
              Handle:
              <input
                type="text"
                value={socialStats.instagram.handle}
                onChange={(e) => updateSocialStat('instagram', 'handle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
            <label style={{ display: 'block', fontSize: '14px', color: '#8B4513' }}>
              Followers:
              <input
                type="number"
                value={socialStats.instagram.followers}
                onChange={(e) => updateSocialStat('instagram', 'followers', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          {/* Facebook */}
          <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0, color: '#654321', fontSize: '16px' }}>Facebook</h4>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8B4513' }}>
              Handle:
              <input
                type="text"
                value={socialStats.facebook.handle}
                onChange={(e) => updateSocialStat('facebook', 'handle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
            <label style={{ display: 'block', fontSize: '14px', color: '#8B4513' }}>
              Followers:
              <input
                type="number"
                value={socialStats.facebook.followers}
                onChange={(e) => updateSocialStat('facebook', 'followers', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          {/* Twitter */}
          <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0, color: '#654321', fontSize: '16px' }}>Twitter/X</h4>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8B4513' }}>
              Handle:
              <input
                type="text"
                value={socialStats.twitter.handle}
                onChange={(e) => updateSocialStat('twitter', 'handle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
            <label style={{ display: 'block', fontSize: '14px', color: '#8B4513' }}>
              Followers:
              <input
                type="number"
                value={socialStats.twitter.followers}
                onChange={(e) => updateSocialStat('twitter', 'followers', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          {/* YouTube */}
          <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0, color: '#654321', fontSize: '16px' }}>YouTube</h4>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8B4513' }}>
              Handle:
              <input
                type="text"
                value={socialStats.youtube.handle}
                onChange={(e) => updateSocialStat('youtube', 'handle', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
            <label style={{ display: 'block', fontSize: '14px', color: '#8B4513' }}>
              Subscribers:
              <input
                type="number"
                value={socialStats.youtube.subscribers}
                onChange={(e) => updateSocialStat('youtube', 'subscribers', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '4px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>
        </div>

        <button
          onClick={handleSaveSocialStats}
          disabled={savingSocial}
          style={{
            padding: '12px 32px',
            backgroundColor: savingSocial ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: savingSocial ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          {savingSocial ? 'Saving...' : 'Save Social Media Stats'}
        </button>
      </div>

      <h2 style={{ marginTop: '48px', marginBottom: '16px', color: '#654321' }}>Database Operations</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#654321' }}>🗑️ Clear Data</h3>
          <p style={{ color: '#8B4513', fontSize: '14px' }}>
            Delete all non-admin data. Preserves admin accounts but resets their stats.
          </p>
          <button
            onClick={handleClearData}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#D32F2F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              width: '100%'
            }}
          >
            Clear All Data
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#654321' }}>📊 Populate Test Data</h3>
          <p style={{ color: '#8B4513', fontSize: '14px' }}>
            Add 10 test users, 8 breweries, check-ins, and 3 active raffles with entries.
          </p>
          <button
            onClick={handlePopulateData}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              width: '100%'
            }}
          >
            Populate Data
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#654321' }}>🔧 Fix Raffle Counts</h3>
          <p style={{ color: '#8B4513', fontSize: '14px' }}>
            Recalculate totalEntries for all raffles based on actual entries.
          </p>
          <button
            onClick={handleFixRaffleCounts}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#D4922A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              width: '100%'
            }}
          >
            Fix Counts
          </button>
        </div>
      </div>

      {logs.length > 0 && (
        <div style={{
          backgroundColor: '#1E1E1E',
          padding: '20px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '13px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {logs.map((log, idx) => (
            <div
              key={idx}
              style={{
                color: log.type === 'error' ? '#FF6B6B' : log.type === 'success' ? '#51CF66' : '#E0E0E0',
                marginBottom: '4px'
              }}
            >
              [{log.time}] {log.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}