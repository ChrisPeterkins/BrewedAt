import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { ACTIVE_THEME } from '../config/themes';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      loadChallenges();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChallenges = async () => {
    try {
      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('userId', '==', auth.currentUser.uid)
      );
      const checkinsSnapshot = await getDocs(checkinsQuery);

      const uniqueBreweries = new Set();
      let weekendCheckins = 0;
      const now = new Date();
      const startOfWeekend = new Date(now);
      startOfWeekend.setDate(now.getDate() - now.getDay() + 6);
      startOfWeekend.setHours(0, 0, 0, 0);
      const endOfWeekend = new Date(startOfWeekend);
      endOfWeekend.setDate(startOfWeekend.getDate() + 2);

      checkinsSnapshot.forEach(doc => {
        const data = doc.data();
        uniqueBreweries.add(data.breweryId);

        const checkinDate = data.timestamp.toDate();
        if (checkinDate >= startOfWeekend && checkinDate < endOfWeekend) {
          weekendCheckins++;
        }
      });

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const totalPoints = userDoc.data()?.totalPoints || 0;

      const allChallenges = [
        {
          id: 'first_steps',
          icon: 'beer',
          title: 'First Steps',
          description: 'Check in at 5 different breweries',
          progress: uniqueBreweries.size,
          target: 5,
          completed: uniqueBreweries.size >= 5,
        },
        {
          id: 'point_collector',
          icon: 'star-circle',
          title: 'Point Collector',
          description: 'Earn 500 total points',
          progress: totalPoints,
          target: 500,
          completed: totalPoints >= 500,
        },
        {
          id: 'weekend_warrior',
          icon: 'calendar-week',
          title: 'Weekend Warrior',
          description: 'Check in 3 times this weekend',
          progress: weekendCheckins,
          target: 3,
          completed: weekendCheckins >= 3,
        },
        {
          id: 'explorer',
          icon: 'map-marker-path',
          title: 'Explorer',
          description: 'Visit 10 different breweries',
          progress: uniqueBreweries.size,
          target: 10,
          completed: uniqueBreweries.size >= 10,
        },
        {
          id: 'dedicated',
          icon: 'fire',
          title: 'Dedicated',
          description: 'Earn 1000 total points',
          progress: totalPoints,
          target: 1000,
          completed: totalPoints >= 1000,
        },
        {
          id: 'social',
          icon: 'account-group',
          title: 'Social Butterfly',
          description: 'Check in 25 times',
          progress: checkinsSnapshot.size,
          target: 25,
          completed: checkinsSnapshot.size >= 25,
        },
      ];

      const incompleteChallenges = allChallenges.filter(c => !c.completed).slice(0, 3);
      setChallenges(incompleteChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Image
          source={require('../assets/brewedat-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerRight}>
          <View style={styles.statBadge}>
            <MaterialCommunityIcons name="star" size={18} color="#D4922A" />
            <Text style={styles.statBadgeText}>{userData?.totalPoints || 0}</Text>
          </View>
          <View style={styles.statBadge}>
            <MaterialCommunityIcons name="chevron-triple-up" size={18} color="#D4922A" />
            <Text style={styles.statBadgeText}>{userData?.level || 1}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <MaterialCommunityIcons name="account-circle" size={32} color="#D4922A" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Hey, {userData?.name}!</Text>
        <Text style={styles.subtitle}>Ready to discover some great beer?</Text>
      </View>

      {challenges.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Current Challenges</Text>
          <View style={styles.challengesContainer}>
            {challenges.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <MaterialCommunityIcons name={challenge.icon} size={24} color="#D4922A" />
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                </View>
                <Text style={styles.challengeDescription}>{challenge.description}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{challenge.progress} / {challenge.target} {challenge.id.includes('point') ? 'points' : challenge.id.includes('weekend') ? 'check-ins' : challenge.id.includes('social') ? 'check-ins' : 'breweries'}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Your Beer Preferences</Text>
      <View style={styles.preferencesContainer}>
        {userData?.beerPreferences?.map((style) => (
          <View key={style} style={styles.preferenceChip}>
            <Text style={styles.preferenceText}>{style}</Text>
          </View>
        ))}
      </View>

      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>No events yet</Text>
        <Text style={styles.ctaSubtitle}>Check in at your first brewery to start earning points!</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('Events')}>
          <Text style={styles.ctaButtonText}>Explore Events</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACTIVE_THEME.backgroundColor,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 150,
    height: 60,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#654321',
  },
  profileButton: {
    padding: 4,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B4513',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 16,
  },
  challengesContainer: {
    gap: 12,
    marginBottom: 32,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#654321',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4922A',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#654321',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  preferenceChip: {
    backgroundColor: '#D4922A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  preferenceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 32,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#D4922A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});