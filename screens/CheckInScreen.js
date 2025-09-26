import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Animated, Modal } from 'react-native';
import * as Location from 'expo-location';
import { CameraView, Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, getDocs, doc, getDoc, updateDoc, increment, addDoc, query, where, orderBy, limit, Timestamp, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase.config';
import { checkAchievements } from '../utils/achievementChecker';
import { ACHIEVEMENTS } from '../constants/achievements';
import CheckInSuccessModal from '../components/CheckInSuccessModal';

export default function CheckInScreen() {
  const [location, setLocation] = useState(null);
  const [nearbyBreweries, setNearbyBreweries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const successAnimation = new Animated.Value(0);
  const checkingInRef = useRef(false);

  useEffect(() => {
    requestLocationAndFindBreweries();
  }, []);

  const requestLocationAndFindBreweries = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to check in');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      await findNearbyBreweries(currentLocation.coords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location');
    } finally {
      setLoading(false);
    }
  };

  const findNearbyBreweries = async (userLocation) => {
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const breweries = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const CHECK_IN_RADIUS = 0.5; // miles
      const nearby = breweries.filter(brewery => {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          brewery.coordinates.latitude,
          brewery.coordinates.longitude
        );
        return distance <= CHECK_IN_RADIUS;
      });

      setNearbyBreweries(nearby);
    } catch (error) {
      console.error('Error finding breweries:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
    if (status === 'granted') {
      setShowQRScanner(true);
      setScanned(false);
    } else {
      Alert.alert('Permission denied', 'Camera permission is required to scan QR codes');
    }
  };

  const handleQRCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const qrData = JSON.parse(data);

      if (!qrData.breweryId || qrData.app !== 'BrewedAt') {
        Alert.alert('Invalid QR Code', 'This is not a valid BrewedAt brewery QR code');
        setShowQRScanner(false);
        return;
      }

      const breweryDoc = await getDoc(doc(db, 'events', qrData.breweryId));

      if (!breweryDoc.exists()) {
        Alert.alert('Error', 'Brewery not found');
        setShowQRScanner(false);
        return;
      }

      const brewery = { id: breweryDoc.id, ...breweryDoc.data() };
      setShowQRScanner(false);
      await handleCheckIn(brewery, 'qr');
    } catch (error) {
      console.error('Error scanning QR code:', error);
      Alert.alert('Error', 'Invalid QR code format');
      setShowQRScanner(false);
    }
  };

  const handleCheckIn = async (brewery, method = 'location') => {
    if (checkingInRef.current) return;
    checkingInRef.current = true;
    setCheckingIn(true);

    try {
      const COOLDOWN_HOURS = 24;
      const cooldownTime = Timestamp.fromMillis(Date.now() - (COOLDOWN_HOURS * 60 * 60 * 1000));

      const recentCheckinsQuery = query(
        collection(db, 'checkins'),
        where('userId', '==', auth.currentUser.uid),
        where('breweryId', '==', brewery.id),
        where('timestamp', '>', cooldownTime),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const recentCheckinsSnapshot = await getDocs(recentCheckinsQuery);

      if (!recentCheckinsSnapshot.empty) {
        const lastCheckin = recentCheckinsSnapshot.docs[0].data();
        const lastCheckinTime = lastCheckin.timestamp.toMillis();
        const timeDiff = Date.now() - lastCheckinTime;
        const hoursRemaining = Math.ceil((COOLDOWN_HOURS * 60 * 60 * 1000 - timeDiff) / (60 * 60 * 1000));

        checkingInRef.current = false;
        setCheckingIn(false);
        Alert.alert(
          'Already Checked In',
          `You've already checked in at ${brewery.name} recently. Please wait ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''} before checking in again.`
        );
        return;
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        checkingInRef.current = false;
        setCheckingIn(false);
        Alert.alert('Error', 'User profile not found');
        return;
      }

      const userData = userDoc.data();
      const newPoints = (userData.totalPoints || 0) + brewery.pointsReward;
      const newLevel = Math.floor(newPoints / 100) + 1;

      await updateDoc(userRef, {
        totalPoints: increment(brewery.pointsReward),
        level: newLevel,
      });

      await addDoc(collection(db, 'checkins'), {
        userId: auth.currentUser.uid,
        breweryId: brewery.id,
        breweryName: brewery.name,
        points: brewery.pointsReward,
        method: method,
        timestamp: Timestamp.now(),
      });

      const updatedUserDoc = await getDoc(userRef);
      const updatedUserData = updatedUserDoc.data();
      const newAchievements = await checkAchievements(auth.currentUser.uid, updatedUserData);

      if (newAchievements.length > 0) {
        await updateDoc(userRef, {
          achievements: arrayUnion(...newAchievements)
        });
      }

      setSuccessData({
        breweryName: brewery.name,
        pointsEarned: brewery.pointsReward,
        totalPoints: newPoints,
        level: newLevel,
        newAchievements: newAchievements
      });
      setShowSuccessModal(true);

      await requestLocationAndFindBreweries();
    } catch (error) {
      console.error('Error checking in:', error);
      Alert.alert('Error', 'Could not complete check-in. Please try again.');
    } finally {
      checkingInRef.current = false;
      setCheckingIn(false);
    }
  };

  const playSuccessAnimation = () => {
    Animated.sequence([
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(successAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderBrewery = ({ item }) => {
    const distance = location
      ? calculateDistance(
          location.latitude,
          location.longitude,
          item.coordinates.latitude,
          item.coordinates.longitude
        )
      : null;

    return (
      <View style={styles.breweryCard}>
        <View style={styles.breweryHeader}>
          <MaterialCommunityIcons name="beer" size={32} color="#D4922A" />
          <View style={styles.breweryInfo}>
            <Text style={styles.breweryName}>{item.name}</Text>
            <Text style={styles.breweryAddress}>{item.address}</Text>
            {distance !== null && (
              <Text style={styles.breweryDistance}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#8B4513" />
                {' '}{distance.toFixed(2)} mi away
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkInButton, checkingIn && styles.checkInButtonDisabled]}
          onPress={() => handleCheckIn(item)}
          disabled={checkingIn}
        >
          <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
          <Text style={styles.checkInButtonText}>
            Check In (+{item.pointsReward} pts)
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="loading" size={48} color="#D4922A" />
        <Text style={styles.loadingText}>Finding nearby breweries...</Text>
      </View>
    );
  }

  if (nearbyBreweries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="map-marker-off" size={80} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>No breweries nearby</Text>
        <Text style={styles.emptySubtitle}>
          You must be within 0.5 miles of a brewery to check in via location
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={requestLocationAndFindBreweries}
        >
          <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.refreshButtonText}>Refresh Location</Text>
        </TouchableOpacity>

        <View style={styles.orDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.qrScanButton}
          onPress={requestCameraPermission}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={24} color="#FFFFFF" />
          <Text style={styles.qrScanButtonText}>Scan QR Code</Text>
        </TouchableOpacity>

        <Modal
          visible={showQRScanner}
          animationType="slide"
          onRequestClose={() => setShowQRScanner(false)}
        >
          <View style={styles.qrContainer}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrTitle}>Scan Brewery QR Code</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowQRScanner(false)}
              >
                <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <CameraView
              style={styles.camera}
              onBarcodeScanned={handleQRCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            >
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerFrame} />
                <Text style={styles.scannerText}>Position QR code within frame</Text>
              </View>
            </CameraView>
          </View>
        </Modal>

        <Animated.View
          style={[
            styles.successOverlay,
            {
              opacity: successAnimation,
              transform: [{
                scale: successAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              }],
            },
          ]}
          pointerEvents="none"
        >
          <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Check In</Text>
            <Text style={styles.subtitle}>
              {nearbyBreweries.length} {nearbyBreweries.length === 1 ? 'brewery' : 'breweries'} nearby
            </Text>
          </View>
          <TouchableOpacity
            style={styles.qrButton}
            onPress={requestCameraPermission}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={28} color="#D4922A" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={nearbyBreweries}
        renderItem={renderBrewery}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      <Animated.View
        style={[
          styles.successOverlay,
          {
            opacity: successAnimation,
            transform: [{
              scale: successAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            }],
          },
        ]}
        pointerEvents="none"
      >
        <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
      </Animated.View>

      <Modal
        visible={showQRScanner}
        animationType="slide"
        onRequestClose={() => setShowQRScanner(false)}
      >
        <View style={styles.qrContainer}>
          <View style={styles.qrHeader}>
            <Text style={styles.qrTitle}>Scan Brewery QR Code</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQRScanner(false)}
            >
              <MaterialCommunityIcons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={handleQRCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>Position QR code within frame</Text>
            </View>
          </CameraView>
        </View>
      </Modal>

      {successData && (
        <CheckInSuccessModal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          breweryName={successData.breweryName}
          pointsEarned={successData.pointsEarned}
          totalPoints={successData.totalPoints}
          level={successData.level}
          newAchievements={successData.newAchievements}
        />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAF8',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#654321',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 32,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4922A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  listContent: {
    padding: 20,
  },
  breweryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  breweryHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  breweryInfo: {
    flex: 1,
  },
  breweryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#654321',
    marginBottom: 4,
  },
  breweryAddress: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 4,
  },
  breweryDistance: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4922A',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  checkInButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrButton: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D4922A',
  },
  qrContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D4922A',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#D4922A',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 40,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
  },
  qrScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#654321',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  qrScanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});