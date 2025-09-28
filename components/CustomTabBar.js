import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CustomTabBar({ state, descriptors, navigation, setHideTabBar }) {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const prevIndexRef = React.useRef(state.index);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isMounted, fadeAnim, slideAnim]);

  useEffect(() => {
    if (isMounted && prevIndexRef.current !== state.index) {
      setIsTransitioning(true);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setHideTabBar(true);
      });

      setTimeout(() => {
        setIsTransitioning(false);
        setHideTabBar(false);

        fadeAnim.setValue(0);
        slideAnim.setValue(20);

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1600);

      prevIndexRef.current = state.index;
    }
  }, [state.index, setHideTabBar, fadeAnim, slideAnim, isMounted]);

  return (
    <Animated.View style={[{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;
        const isCheckIn = route.name === 'Check In';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? '#D4922A' : '#8B4513';
        const iconColor = isCheckIn ? '#FFFFFF' : color;
        const icon = options.tabBarIcon({ color: iconColor, size: isCheckIn ? 28 : 24 });

        if (isCheckIn) {
          return (
            <View key={route.key} style={styles.centerButtonContainer}>
              <TouchableOpacity
                onPress={onPress}
                style={styles.centerButton}
              >
                <View style={styles.centerButtonInner}>
                  {icon}
                </View>
              </TouchableOpacity>
              <Text style={[styles.label, { color }]}>{label}</Text>
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
          >
            {icon}
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 8,
    height: Platform.OS === 'ios' ? 100 : 70,
    alignItems: 'flex-start',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: -20,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D4922A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  centerButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});