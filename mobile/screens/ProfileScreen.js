import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { ACHIEVEMENTS } from '../constants/achievements';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [checkinsCount, setCheckinsCount] = useState(0);
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

      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      const checkinsSnapshot = await getDocs(checkinsQuery);
      const checkinsData = checkinsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCheckins(checkinsData.slice(0, 5));
      setCheckinsCount(checkinsData.length);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const userAchievements = userData?.achievements || [];
  const achievements = ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: userAchievements.includes(achievement.id),
  }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={80} color="#D4922A" />
        </View>
        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData?.totalPoints || 0}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData?.level || 1}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{checkinsCount}</Text>
          <Text style={styles.statLabel}>Check-ins</Text>
        </View>
      </View>

      {checkins.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Check-ins</Text>
          {checkins.map((checkin) => (
            <View key={checkin.id} style={styles.checkinCard}>
              <View style={styles.checkinHeader}>
                <MaterialCommunityIcons name="beer" size={24} color="#D4922A" />
                <View style={styles.checkinInfo}>
                  <Text style={styles.checkinBrewery}>{checkin.breweryName}</Text>
                  <Text style={styles.checkinDetails}>
                    {checkin.timestamp?.toDate ? checkin.timestamp.toDate().toLocaleDateString() : 'N/A'} • +{checkin.points} pts • {checkin.method}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementLocked,
              ]}
            >
              <MaterialCommunityIcons
                name={achievement.icon}
                size={40}
                color={achievement.unlocked ? '#D4922A' : '#CCCCCC'}
              />
              <Text
                style={[
                  styles.achievementName,
                  !achievement.unlocked && styles.achievementNameLocked,
                ]}
              >
                {achievement.name}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Beer Preferences</Text>
        <View style={styles.preferencesContainer}>
          {userData?.beerPreferences?.map((style) => (
            <View key={style} style={styles.preferenceChip}>
              <Text style={styles.preferenceText}>{style}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="account-edit" size={24} color="#654321" />
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="cog" size={24} color="#654321" />
          <Text style={styles.menuItemText}>Settings</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="help-circle" size={24} color="#654321" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.signOutButton]} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" />
          <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#8B4513',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4922A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#654321',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementNameLocked: {
    color: '#999',
  },
  achievementDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#654321',
    marginLeft: 12,
  },
  signOutButton: {
    marginTop: 8,
  },
  signOutText: {
    color: '#D32F2F',
  },
  checkinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  checkinHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  checkinInfo: {
    flex: 1,
  },
  checkinBrewery: {
    fontSize: 16,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 4,
  },
  checkinDetails: {
    fontSize: 12,
    color: '#8B4513',
  },
});