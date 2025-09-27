import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase.config';
import { useFocusEffect } from '@react-navigation/native';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');

  useFocusEffect(
    React.useCallback(() => {
      fetchLeaderboard();
    }, [timeFilter])
  );

  const fetchLeaderboard = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('totalPoints', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(usersQuery);
      const users = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));

      setLeaderboard(users);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#8B4513';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'medal';
    return 'account-circle';
  };

  const renderLeaderboardItem = ({ item }) => {
    const isCurrentUser = item.id === auth.currentUser?.uid;

    return (
      <View style={[styles.userCard, isCurrentUser && styles.currentUserCard]}>
        <View style={styles.rankContainer}>
          <MaterialCommunityIcons
            name={getRankIcon(item.rank)}
            size={32}
            color={getRankColor(item.rank)}
          />
          <Text style={[styles.rankText, { color: getRankColor(item.rank) }]}>
            #{item.rank}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, isCurrentUser && styles.currentUserText]}>
            {item.displayName || item.name || 'Anonymous'}
            {isCurrentUser && ' (You)'}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={14} color="#D4922A" />
              <Text style={styles.statText}>{item.totalPoints || 0} pts</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-star" size={14} color="#D4922A" />
              <Text style={styles.statText}>Level {item.level || 1}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="trophy" size={14} color="#D4922A" />
              <Text style={styles.statText}>{item.achievements?.length || 0}</Text>
            </View>
          </View>
        </View>

        {item.rank <= 3 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TOP {item.rank}</Text>
          </View>
        )}
      </View>
    );
  };

  const currentUserRank = leaderboard.findIndex(user => user.id === auth.currentUser?.uid) + 1;
  const currentUser = leaderboard.find(user => user.id === auth.currentUser?.uid);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={48} color="#D4922A" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top brewmasters in BrewedAt</Text>
      </View>

      {currentUser && currentUserRank > 0 && (
        <View style={styles.currentUserBanner}>
          <View style={styles.bannerContent}>
            <MaterialCommunityIcons name="account" size={40} color="#D4922A" />
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerTitle}>Your Rank</Text>
              <Text style={styles.bannerRank}>#{currentUserRank}</Text>
            </View>
            <View style={styles.bannerStats}>
              <Text style={styles.bannerPoints}>{currentUser.totalPoints || 0}</Text>
              <Text style={styles.bannerLabel}>points</Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4922A"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="trophy-outline" size={80} color="#CCCCCC" />
            <Text style={styles.emptyText}>No users yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAF8',
  },
  loadingText: {
    fontSize: 16,
    color: '#8B4513',
    marginTop: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B4513',
  },
  currentUserBanner: {
    backgroundColor: '#FFF9E6',
    borderBottomWidth: 2,
    borderBottomColor: '#D4922A',
    padding: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 4,
  },
  bannerRank: {
    fontSize: 24,
    fontWeight: '700',
    color: '#654321',
  },
  bannerStats: {
    alignItems: 'flex-end',
  },
  bannerPoints: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4922A',
  },
  bannerLabel: {
    fontSize: 12,
    color: '#8B4513',
  },
  listContent: {
    padding: 20,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: '#D4922A',
    backgroundColor: '#FFF9E6',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 8,
  },
  currentUserText: {
    color: '#D4922A',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#D4922A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#CCCCCC',
    marginTop: 16,
  },
});