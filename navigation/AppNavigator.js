import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import EventsScreen from '../screens/EventsScreen';
import CheckInScreen from '../screens/CheckInScreen';
import CheckInResultScreen from '../screens/CheckInResultScreen';
import RaffleScreen from '../screens/RaffleScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TransitionWrapper from '../components/TransitionWrapper';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function CheckInStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CheckInMain" component={CheckInScreen} />
      <Stack.Screen name="CheckInResult" component={CheckInResultScreen} />
    </Stack.Navigator>
  );
}

const HomeWithTransition = () => (
  <TransitionWrapper>
    <HomeScreen />
  </TransitionWrapper>
);

const EventsWithTransition = () => (
  <TransitionWrapper>
    <EventsScreen />
  </TransitionWrapper>
);

const CheckInWithTransition = () => (
  <TransitionWrapper>
    <CheckInStack />
  </TransitionWrapper>
);

const RaffleWithTransition = () => (
  <TransitionWrapper>
    <RaffleScreen />
  </TransitionWrapper>
);

const LeaderboardWithTransition = () => (
  <TransitionWrapper>
    <LeaderboardScreen />
  </TransitionWrapper>
);

const ProfileWithTransition = () => (
  <TransitionWrapper>
    <ProfileScreen />
  </TransitionWrapper>
);

function MainTabs() {
  const [hideTabBar, setHideTabBar] = React.useState(false);

  return (
    <Tab.Navigator
      tabBar={(props) => hideTabBar ? null : <CustomTabBar {...props} setHideTabBar={setHideTabBar} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#D4922A',
        tabBarInactiveTintColor: '#8B4513',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeWithTransition}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsWithTransition}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-star" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Check In"
        component={CheckInWithTransition}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Raffles"
        component={RaffleWithTransition}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="gift" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardWithTransition}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="Profile" component={ProfileWithTransition} />
    </RootStack.Navigator>
  );
}