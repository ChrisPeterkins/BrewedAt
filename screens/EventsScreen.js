import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';
import BreweryDetailModal from '../components/BreweryDetailModal';

export default function EventsScreen() {
  const [location, setLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    loadEvents();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to show nearby events');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const renderEventCard = ({ item }) => {
    const distance = location
      ? calculateDistance(
          location.latitude,
          location.longitude,
          item.coordinates.latitude,
          item.coordinates.longitude
        )
      : null;

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleBreweryPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.eventHeader}>
          <MaterialCommunityIcons name="beer" size={24} color="#D4922A" />
          <Text style={styles.eventName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
        </View>
        <Text style={styles.eventAddress} numberOfLines={2} ellipsizeMode="tail">
          {item.address}
        </Text>
        {distance && (
          <View style={styles.eventFooter}>
            <View style={styles.distanceContainer}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#8B4513" />
              <Text style={styles.distance}>{distance} mi</Text>
            </View>
            <Text style={styles.points}>+{item.pointsReward} pts</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleBreweryPress = (brewery) => {
    setSelectedEvent(brewery);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setSelectedEvent(null);
    }, 250);
  };

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={location}
        showsUserLocation
        showsMyLocationButton
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.coordinates.latitude,
              longitude: event.coordinates.longitude,
            }}
            title={event.name}
            description={event.description}
            onPress={() => setSelectedEvent(event)}
          >
            <View style={styles.markerContainer}>
              <MaterialCommunityIcons name="beer" size={30} color="#D4922A" />
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Nearby Breweries ({events.length})</Text>
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <BreweryDetailModal
        visible={modalVisible}
        brewery={selectedEvent}
        onClose={handleCloseModal}
        userLocation={location}
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
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D4922A',
  },
  listContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 70, // Account for tab bar height
    left: 0,
    right: 0,
    backgroundColor: '#FFF8E7',
    paddingTop: 16,
    paddingBottom: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    height: 180, // Fixed height to prevent text cutoff
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#654321',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingRight: 40, // Extra padding at the end for last card
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    width: 240,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 120, // Fixed height to prevent content overflow
    justifyContent: 'space-between',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#654321',
    flex: 1,
  },
  eventAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    lineHeight: 16,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
  },
  points: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4922A',
  },
});