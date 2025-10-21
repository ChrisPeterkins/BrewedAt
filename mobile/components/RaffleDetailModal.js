import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RaffleDetailModal({ visible, raffle, onClose, onEnter, userEntries, userPoints }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    if (visible) {
      // Reset animation values immediately EVERY time modal opens
      fadeAnim.setValue(0);
      slideAnim.setValue(800);

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
    } else {
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
  }, [visible]);

  if (!raffle) return null;

  const userEntriesCount = userEntries || 0;
  const canEnter = userEntriesCount < raffle.maxEntriesPerUser && userPoints >= raffle.costPerEntry;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'TBD';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'long',
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
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

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
            <Text style={styles.modalTitle}>Raffle Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={28} color="#654321" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {raffle.imageUrl && (
              <Image
                source={{ uri: raffle.imageUrl }}
                style={styles.prizeImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.prizeHeader}>
              <MaterialCommunityIcons name="gift" size={48} color="#D4922A" />
              <View style={styles.prizeHeaderText}>
                <Text style={styles.prizeName}>{raffle.prizeName}</Text>
                <Text style={styles.prizeValue}>
                  {raffle.prizeValue && `Value: $${raffle.prizeValue}`}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{raffle.description}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="ticket" size={24} color="#D4922A" />
                <Text style={styles.statValue}>{raffle.costPerEntry}</Text>
                <Text style={styles.statLabel}>Points per entry</Text>
              </View>

              <View style={styles.statCard}>
                <MaterialCommunityIcons name="account-multiple" size={24} color="#D4922A" />
                <Text style={styles.statValue}>{raffle.totalEntries || 0}</Text>
                <Text style={styles.statLabel}>Total entries</Text>
              </View>

              <View style={styles.statCard}>
                <MaterialCommunityIcons name="account-check" size={24} color="#D4922A" />
                <Text style={styles.statValue}>{userEntriesCount}/{raffle.maxEntriesPerUser}</Text>
                <Text style={styles.statLabel}>Your entries</Text>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#8B4513" />
                <Text style={styles.infoText}>{getTimeRemaining(raffle.endDate)}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar" size={20} color="#8B4513" />
                <Text style={styles.infoText}>Ends: {formatDate(raffle.endDate)}</Text>
              </View>
              {raffle.drawDate && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="trophy" size={20} color="#8B4513" />
                  <Text style={styles.infoText}>Winner drawn: {formatDate(raffle.drawDate)}</Text>
                </View>
              )}
            </View>

            {raffle.rules && (
              <View style={styles.rulesSection}>
                <Text style={styles.rulesTitle}>Rules & Details</Text>
                <Text style={styles.rulesText}>{raffle.rules}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.enterButton, !canEnter && styles.enterButtonDisabled]}
              onPress={onEnter}
              disabled={!canEnter}
            >
              <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#FFFFFF" />
              <Text style={styles.enterButtonText}>
                {userEntriesCount >= raffle.maxEntriesPerUser
                  ? 'Max Entries Reached'
                  : userPoints < raffle.costPerEntry
                  ? 'Not Enough Points'
                  : `Enter Raffle (${raffle.costPerEntry} pts)`}
              </Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
  modalBody: {
    padding: 20,
  },
  prizeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  prizeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  prizeHeaderText: {
    flex: 1,
  },
  prizeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 4,
  },
  prizeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4922A',
  },
  description: {
    fontSize: 16,
    color: '#8B4513',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#654321',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#8B4513',
  },
  rulesSection: {
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 12,
  },
  rulesText: {
    fontSize: 14,
    color: '#8B4513',
    lineHeight: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4922A',
    padding: 16,
    borderRadius: 12,
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
});