import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

export default function ScreenTransition({ children, isVisible }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieOpacity = useRef(new Animated.Value(1)).current;
  const lottieRef = useRef(null);
  const [showLottie, setShowLottie] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowContent(false);
      fadeAnim.setValue(0);
      lottieOpacity.setValue(1);
      setShowLottie(true);

      setTimeout(() => {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      }, 50);

      Animated.sequence([
        Animated.delay(1200),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(lottieOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowLottie(false);
      });

      setTimeout(() => {
        setShowContent(true);
      }, 1000);
    }
  }, [isVisible]);

  return (
    <>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {showContent && children}
      </Animated.View>
      {showLottie && (
        <Animated.View
          style={[styles.lottieContainer, { opacity: lottieOpacity }]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={['#F5F5DC', '#FFF8E7', '#E8A540']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.contentContainer}>
            <Image
              source={require('../assets/brewedat-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <LottieView
              ref={lottieRef}
              source={require('../assets/Beer Refill.json')}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
          </View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lottieContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  contentContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 110,
    marginBottom: 40,
  },
  lottie: {
    width: 200,
    height: 200,
  },
});