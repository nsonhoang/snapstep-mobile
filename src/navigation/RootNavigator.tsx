import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from './AuthContext';
import { RootStackParamList } from './types';
import { LoginScreen } from '../screens/LoginScreen';

import { HomeScreen } from '../screens/HomeScreen';
import { PasswordScreen } from '../screens/PasswordScreen';

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
          // Private Route
          <Stack.Screen name="Home" component={HomeScreen} />
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
