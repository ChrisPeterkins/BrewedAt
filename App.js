import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase.config';
import AuthScreen from './screens/AuthScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import AppNavigator from './navigation/AppNavigator';
import ScreenTransition from './components/ScreenTransition';

export default function App() {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [screenKey, setScreenKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const profileExists = userDoc.exists();

        setTimeout(() => {
          setUser(currentUser);
          setHasProfile(profileExists);
          setLoading(false);
          setScreenKey(prev => prev + 1);
        }, 50);
      } else {
        setUser(currentUser);
        setHasProfile(false);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleProfileComplete = () => {
    setHasProfile(true);
    setScreenKey(prev => prev + 1);
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <>
        <StatusBar style="auto" />
        <ScreenTransition key={screenKey} isVisible={true}>
          <AuthScreen />
        </ScreenTransition>
      </>
    );
  }

  if (!hasProfile) {
    return (
      <>
        <StatusBar style="auto" />
        <ScreenTransition key={screenKey} isVisible={true}>
          <ProfileSetupScreen onComplete={handleProfileComplete} />
        </ScreenTransition>
      </>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <ScreenTransition key={screenKey} isVisible={true}>
          <AppNavigator />
        </ScreenTransition>
      </NavigationContainer>
    </>
  );
}