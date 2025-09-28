import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment, addDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase.config';
import { useFocusEffect } from '@react-navigation/native';

export default function RaffleScreen() {
  const [raffles, setRaffles] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userEntries, setUserEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchRaffles();
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserPoints(userDoc.data().totalPoints || 0);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchRaffles = async () => {
    try {
      const rafflesQuery = query(
        collection(db, 'raffles'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(rafflesQuery);
      console.log('Total raffles in DB:', snapshot.docs.length);

      const now = new Date();
      const raffleData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raffle:', doc.id, 'status:', data.status, 'endDate:', data.endDate?.toDate());
        return {
          id: doc.id,
          ...data
        };
      }).filter(raffle => {
        return raffle.status === 'active' && raffle.endDate && raffle.endDate.toDate() > now;
      });

      console.log('Active raffles after filter:', raffleData.length);
      setRaffles(raffleData);

      const entriesQuery = query(
        collection(db, 'raffleEntries'),
        where('userId', '==', auth.currentUser.uid)
      );
      const entriesSnapshot = await getDocs(entriesQuery);
      const entries = {};
      entriesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        entries[data.raffleId] = (entries[data.raffleId] || 0) + data.entriesCount;
      });
      setUserEntries(entries);
    } catch (error) {
      console.error('Error fetching raffles:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', `Could not load raffles: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRaffles();
    fetchUserData();
  };

  const handleEnterRaffle = async (raffle) => {
    const currentEntries = userEntries[raffle.id] || 0;

    if (currentEntries >= raffle.maxEntriesPerUser) {
      Alert.alert('Max Entries Reached', `You've already entered the maximum of ${raffle.maxEntriesPerUser} times.`);
      return;
    }

    if (userPoints < raffle.costPerEntry) {
      Alert.alert('Not Enough Points', `You need ${raffle.costPerEntry} points to enter this raffle. You have ${userPoints} points.`);
      return;
    }

    Alert.alert(
      'Enter Raffle',
      `Spend ${raffle.costPerEntry} points for 1 entry?\n\nYou have ${currentEntries}/${raffle.maxEntriesPerUser} entries.\nYour balance: ${userPoints} points`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enter',
          onPress: async () => {
            try {
              const userRef = doc(db, 'users', auth.currentUser.uid);
              await updateDoc(userRef, {
                totalPoints: increment(-raffle.costPerEntry)
              });

              await addDoc(collection(db, 'raffleEntries'), {
                raffleId: raffle.id,
                userId: auth.currentUser.uid,
                entriesCount: 1,
                timestamp: Timestamp.now()
              });

              const raffleRef = doc(db, 'raffles', raffle.id);
              await updateDoc(raffleRef, {
                totalEntries: increment(1)
              });

              const updatedEntries = { ...userEntries };
              updatedEntries[raffle.id] = currentEntries + 1;
              setUserEntries(updatedEntries);
              setUserPoints(prev => prev - raffle.costPerEntry);

              Alert.alert('Success!', 'You\'ve entered the raffle. Good luck!');
            } catch (error) {
              console.error('Error entering raffle:', error);
              Alert.alert('Error', 'Could not enter raffle. Please try again.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'TBD';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (endDate) => {
    if (!endDate) return 'TBD';
    const now = new Date();
    const end = endDate.toDate();
    const diff = end - now;

    if (diff < 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Ending soon';
  };

  const renderRaffleCard = ({ item }) => {
    const userEntriesCount = userEntries[item.id] || 0;
    const totalEntries = item.totalEntries || 0;
    const canEnter = userEntriesCount < item.maxEntriesPerUser && userPoints >= item.costPerEntry;

    return (
      <View style={styles.raffleCard}>
        <View style={styles.raffleHeader}>
          <View style={styles.prizeSection}>
            <MaterialCommunityIcons name="gift" size={40} color="#D4922A" />
            <View style={styles.prizeInfo}>
              <Text style={styles.prizeTitle}>{item.prizeName}</Text>
              <Text style={styles.prizeDescription}>{item.description}</Text>
            </View>
          </View>
        </View>

        <View style={styles.raffleDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="ticket" size={20} color="#8B4513" />
            <Text style={styles.detailText}>{item.costPerEntry} points per entry</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account-multiple" size={20} color="#8B4513" />
            <Text style={styles.detailText}>{totalEntries} total entries</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#8B4513" />
            <Text style={styles.detailText}>{getTimeRemaining(item.endDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#8B4513" />
            <Text style={styles.detailText}>Ends: {formatDate(item.endDate)}</Text>
          </View>
        </View>

        {userEntriesCount > 0 && (
          <View style={styles.userEntriesBanner}>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.userEntriesText}>
              You have {userEntriesCount} {userEntriesCount === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.enterButton, !canEnter && styles.enterButtonDisabled]}
          onPress={() => handleEnterRaffle(item)}
          disabled={!canEnter}
        >
          <MaterialCommunityIcons
            name="ticket-confirmation"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.enterButtonText}>
            {userEntriesCount >= item.maxEntriesPerUser
              ? 'Max Entries Reached'
              : userPoints < item.costPerEntry
              ? 'Not Enough Points'
              : `Enter Raffle (${item.costPerEntry} pts)`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={48} color="#D4922A" />
        <Text style={styles.loadingText}>Loading raffles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Raffles</Text>
        <Text style={styles.subtitle}>Enter to win exclusive prizes</Text>
      </View>

      <View style={styles.pointsBanner}>
        <View style={styles.pointsContent}>
          <MaterialCommunityIcons name="star" size={32} color="#D4922A" />
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsLabel}>Your Points</Text>
            <Text style={styles.pointsValue}>{userPoints}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={raffles}
        renderItem={renderRaffleCard}
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
            <MaterialCommunityIcons name="gift-outline" size={80} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No Active Raffles</Text>
            <Text style={styles.emptySubtitle}>Check back soon for new prizes!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
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
  pointsBanner: {
    backgroundColor: '#FFF9E6',
    borderBottomWidth: 2,
    borderBottomColor: '#D4922A',
    padding: 16,
  },
  pointsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#654321',
  },
  listContent: {
    padding: 20,
  },
  raffleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  raffleHeader: {
    marginBottom: 16,
  },
  prizeSection: {
    flexDirection: 'row',
    gap: 16,
  },
  prizeInfo: {
    flex: 1,
  },
  prizeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 4,
  },
  prizeDescription: {
    fontSize: 14,
    color: '#8B4513',
    lineHeight: 20,
  },
  raffleDetails: {
    gap: 12,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#8B4513',
  },
  userEntriesBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  userEntriesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4922A',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  enterButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#654321',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
  },
});