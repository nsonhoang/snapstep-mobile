import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { MainTabParamList } from './types';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { ExploreScreen } from '../screens/ExploreScreen';
import { MapScreen } from '../screens/MapScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Dummy fallback for Snap tab
const DummySnapScreen = () => null;

// Pulsing & Glowing Snap Button Component (Reanimated 60FPS)
const AnimatedSnapTabIcon = (): React.JSX.Element => {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value * 1.05 }],
      opacity: 0.35 + (pulse.value - 1) * 3.5, // 0.35 -> 0.7
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  return (
    <View style={styles.snapWrapper}>
      {/* Outer Glowing Pulsing Ring */}
      <Animated.View style={[styles.glowRing, glowStyle]} />
      {/* Main Elevated Shutter Button */}
      <Animated.View style={[styles.snapIconContainer, buttonStyle]}>
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
        name="Map"
        component={MapScreen}
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size || 22} color={color} />
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
