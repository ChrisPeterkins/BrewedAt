import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import { ACHIEVEMENTS } from '../constants/achievements';

export default function UserProfileModal({ visible, userId, onClose }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ checkins: 0, uniqueBreweries: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    if (visible && userId) {
      // Reset animation values immediately EVERY time modal opens
      fadeAnim.setValue(0);
      slideAnim.setValue(800);

      // Start loading and animations together
      loadUserProfile();

      // Small delay to let Modal render
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }),
        ]).start();
      }, 50);
    } else if (!visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 800,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Reset after close animation completes
        fadeAnim.setValue(0);
        slideAnim.setValue(800);
      });
    }
  }, [visible, userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }

      const checkinsQuery = query(
        collection(db, 'checkins'),
        where('userId', '==', userId)
      );
      const checkinsSnapshot = await getDocs(checkinsQuery);
      const uniqueBreweries = new Set();
      checkinsSnapshot.forEach(doc => {
        uniqueBreweries.add(doc.data().breweryId);
      });

      setStats({
        checkins: checkinsSnapshot.size,
        uniqueBreweries: uniqueBreweries.size,
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userData && !loading) return null;

  const userAchievements = userData?.achievements || [];
  const achievements = ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: userAchievements.includes(achievement.id),
  }));

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>User Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={28} color="#654321" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#D4922A" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <MaterialCommunityIcons name="account-circle" size={80} color="#D4922A" />
                </View>
                <Text style={styles.userName}>{userData?.name || 'Anonymous'}</Text>
                <Text style={styles.userLevel}>Level {userData?.level || 1}</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="star" size={32} color="#D4922A" />
                  <Text style={styles.statValue}>{userData?.totalPoints || 0}</Text>
                  <Text style={styles.statLabel}>Points</Text>
                </View>

                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="beer" size={32} color="#D4922A" />
                  <Text style={styles.statValue}>{stats.checkins}</Text>
                  <Text style={styles.statLabel}>Check-ins</Text>
                </View>

                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="map-marker" size={32} color="#D4922A" />
                  <Text style={styles.statValue}>{stats.uniqueBreweries}</Text>
                  <Text style={styles.statLabel}>Breweries</Text>
                </View>

                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="trophy" size={32} color="#D4922A" />
                  <Text style={styles.statValue}>{userAchievements.length}</Text>
                  <Text style={styles.statLabel}>Achievements</Text>
                </View>
              </View>

              {userData?.beerPreferences && userData.beerPreferences.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Beer Preferences</Text>
                  <View style={styles.preferencesContainer}>
                    {userData.beerPreferences.map((style) => (
                      <View key={style} style={styles.preferenceChip}>
                        <Text style={styles.preferenceText}>{style}</Text>
                      </View>
                    ))}
                  </View>
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
            </ScrollView>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF8E7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#654321',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B4513',
  },
  modalBody: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4922A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
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
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#654321',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 16,
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
});