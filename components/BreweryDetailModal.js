import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Animated, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BreweryDetailModal({ visible, brewery, onClose, userLocation }) {
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

  if (!brewery) return null;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const distance = userLocation && brewery.coordinates
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        brewery.coordinates.latitude,
        brewery.coordinates.longitude
      )
    : null;

  const openDirections = () => {
    const address = encodeURIComponent(brewery.address);
    const url = `https://maps.apple.com/?address=${address}`;
    Linking.openURL(url);
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
            <Text style={styles.modalTitle}>Brewery Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={28} color="#654321" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.breweryHeader}>
              <MaterialCommunityIcons name="beer" size={60} color="#D4922A" />
              <Text style={styles.breweryName}>{brewery.name}</Text>
              {brewery.description && (
                <Text style={styles.breweryDescription}>{brewery.description}</Text>
              )}
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#8B4513" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoText}>{brewery.address}</Text>
                </View>
              </View>

              {distance && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker-distance" size={24} color="#8B4513" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Distance</Text>
                    <Text style={styles.infoText}>{distance} miles away</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="star" size={24} color="#8B4513" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Check-in Reward</Text>
                  <Text style={styles.infoText}>+{brewery.pointsReward} points</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Quick Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="account-group" size={28} color="#D4922A" />
                  <Text style={styles.statValue}>{brewery.totalCheckIns || 0}</Text>
                  <Text style={styles.statLabel}>Total Check-ins</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="account-star" size={28} color="#D4922A" />
                  <Text style={styles.statValue}>{brewery.uniqueVisitors || 0}</Text>
                  <Text style={styles.statLabel}>Unique Visitors</Text>
                </View>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.directionsButton} onPress={openDirections}>
                <MaterialCommunityIcons name="directions" size={24} color="#FFFFFF" />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    height: '80%',
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
  modalBody: {
    padding: 20,
  },
  breweryHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  breweryName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#654321',
    marginTop: 12,
    textAlign: 'center',
  },
  breweryDescription: {
    fontSize: 16,
    color: '#8B4513',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8B4513',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#654321',
    fontWeight: '600',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
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
    textAlign: 'center',
  },
  actionButtons: {
    marginTop: 8,
    marginBottom: 20,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4922A',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});