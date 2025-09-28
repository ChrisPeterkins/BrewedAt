import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CustomTabBar({ state, descriptors, navigation, setHideTabBar }) {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const prevIndexRef = React.useRef(state.index);

  useEffect(() => {
    if (prevIndexRef.current !== state.index) {
      setIsTransitioning(true);
      setHideTabBar(true);

      setTimeout(() => {
        setIsTransitioning(false);
        setHideTabBar(false);
      }, 1600);

      prevIndexRef.current = state.index;
    }
  }, [state.index, setHideTabBar]);

  return (
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