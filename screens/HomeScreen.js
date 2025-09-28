import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { ACTIVE_THEME } from '../config/themes';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
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

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Events')}>
          <MaterialCommunityIcons name="map-marker" size={32} color="#D4922A" />
          <Text style={styles.actionText}>Find Events</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Check In')}>
          <MaterialCommunityIcons name="check-circle" size={32} color="#D4922A" />
          <Text style={styles.actionText}>Check In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Profile')}>
          <MaterialCommunityIcons name="trophy" size={32} color="#D4922A" />
          <Text style={styles.actionText}>Achievements</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Profile')}>
          <MaterialCommunityIcons name="chart-bar" size={32} color="#D4922A" />
          <Text style={styles.actionText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>

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
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
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