import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ACHIEVEMENTS } from '../constants/achievements';

export default function CheckInResultScreen({ route, navigation }) {
  const { success, data } = route.params;

  if (!success) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <MaterialCommunityIcons name="close-circle" size={100} color="#D32F2F" />
          <Text style={styles.errorTitle}>Check-in Failed</Text>
          <Text style={styles.errorMessage}>{data.message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { breweryName, pointsEarned, totalPoints, level, newAchievements = [] } = data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <MaterialCommunityIcons name="check-circle" size={100} color="#4CAF50" />

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
            <MaterialCommunityIcons name="trophy" size={32} color="#D4922A" />
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
                  size={40}
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

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CheckInMain')}
      >
        <Text style={styles.buttonText}>Check In Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Go to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    paddingTop: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#654321',
    marginTop: 24,
    marginBottom: 8,
  },
  breweryName: {
    fontSize: 20,
    color: '#8B4513',
    marginBottom: 32,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D4922A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'center',
  },
  achievementsContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#D4922A',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#654321',
    flex: 1,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 16,
  },
  achievementText: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#8B4513',
  },
  button: {
    backgroundColor: '#D4922A',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D4922A',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#D4922A',
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D32F2F',
    marginTop: 24,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 32,
  },
});