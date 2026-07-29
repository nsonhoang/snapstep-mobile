import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from './AuthContext';
import { RootStackParamList } from './types';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { PasswordScreen } from '../screens/PasswordScreen';
import { PostDetailScreen } from '../screens/PostDetailScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { ConquestScreen } from '../screens/ConquestScreen';
import { SearchBuddiesScreen } from '../screens/SearchBuddiesScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';



const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = (): React.JSX.Element => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      >
        {isAuthenticated ? (
          // Private Routes
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="Conquest"
              component={ConquestScreen}
              options={{
                
                animation: 'slide_from_bottom',
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="SearchBuddies"
              component={SearchBuddiesScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          // Public Routes
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Password" component={PasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
