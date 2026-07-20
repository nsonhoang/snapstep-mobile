import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Animated } from 'react-native';
import { MainTabParamList } from './types';
import { Colors } from '../constants/Colors';
import { ExploreScreen } from '../screens/ExploreScreen';
import { ConquestScreen } from '../screens/ConquestScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Dummy fallback for Snap tab
const DummySnapScreen = () => null;

// Pulsing & Glowing Snap Button Component
const AnimatedSnapTabIcon = (): React.JSX.Element => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.85,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim, glowOpacity]);

  return (
    <View style={styles.snapWrapper}>
      {/* Outer Glowing Pulsing Ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            transform: [{ scale: pulseAnim }],
            opacity: glowOpacity,
          },
        ]}
      />
      {/* Main Elevated Shutter Button */}
      <Animated.View
        style={[
          styles.snapIconContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Feather name="camera" size={24} color={Colors.black} />
      </Animated.View>
    </View>
  );
};

export const MainTabNavigator = (): React.JSX.Element => {
  return (
    <Tab.Navigator
      initialRouteName="Explore"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        animation: 'shift',
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Conquest"
        component={ConquestScreen}
        options={{
          title: 'Conquest',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Snap"
        component={DummySnapScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => <AnimatedSnapTabIcon />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Intercept tab press to navigate directly to Home (Camera Screen)
            e.preventDefault();
            navigation.getParent()?.navigate('Home');
          },
        })}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size || 22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size || 22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0F1417',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  snapWrapper: {
    position: 'absolute',
    top: -24,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    top: -24,
    borderRadius: 32,
    backgroundColor: Colors.primary,
  },
  snapIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 28,
    top: -24,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: '#0F1417',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
});
