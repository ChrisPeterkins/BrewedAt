import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { ACHIEVEMENTS } from '../constants/achievements';

export default function CheckInSuccessModal({
  visible,
  onClose,
  breweryName,
  pointsEarned,
  totalPoints,
  level,
  newAchievements = []
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      if (newAchievements.length > 0 && confettiRef.current) {
        confettiRef.current.start();
      }
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
          </View>

          <Text style={styles.title}>Check-in Successful!</Text>
          <Text style={styles.breweryName}>{breweryName}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>+{pointsEarned}</Text>
              <Text style={styles.statLabel}>Points Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalPoints}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>

          {newAchievements.length > 0 && (
            <View style={styles.achievementsContainer}>
              <View style={styles.achievementHeader}>
                <MaterialCommunityIcons name="trophy" size={24} color="#D4922A" />
                <Text style={styles.achievementTitle}>
                  New Achievement{newAchievements.length > 1 ? 's' : ''} Unlocked!
                </Text>
              </View>
              {newAchievements.map(achievementId => {
                const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
                return (
                  <View key={achievementId} style={styles.achievementBadge}>
                    <MaterialCommunityIcons
                      name={achievement?.icon || 'star'}
                      size={32}
                      color="#D4922A"
                    />
                    <View style={styles.achievementText}>
                      <Text style={styles.achievementName}>{achievement?.name}</Text>
                      <Text style={styles.achievementDescription}>{achievement?.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>

        {newAchievements.length > 0 && (
          <ConfettiCannon
            ref={confettiRef}
            count={200}
            origin={{x: -10, y: 0}}
            autoStart={false}
            fadeOut={true}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 8,
  },
  breweryName: {
    fontSize: 18,
    color: '#8B4513',
    marginBottom: 24,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAFAF8',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4922A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8B4513',
    textAlign: 'center',
  },
  achievementsContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#D4922A',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#654321',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 12,
  },
  achievementText: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#8B4513',
  },
  button: {
    backgroundColor: '#D4922A',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});