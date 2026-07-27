import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAuth } from '../navigation/AuthContext';
import { PasswordScreenProps } from '../navigation/types';
import { Colors } from '../constants/Colors';
import { useAlert } from '../components/AlertProvider';

const CompassIcon = (): React.JSX.Element => (
  <View style={styles.compassOuter}>
    <View style={styles.compassInner}>
      <View style={styles.needleContainer}>
        <View style={styles.needleNorth} />
        <View style={styles.needleSouth} />
      </View>
    </View>
  </View>
);

export const PasswordScreen = ({ route, navigation }: PasswordScreenProps): React.JSX.Element => {
  const { identifier } = route.params;
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fadeValue = useSharedValue(0);

  useEffect(() => {
    fadeValue.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
  }, [fadeValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeValue.value,
    };
  });

  const handleLogin = (): void => {
    if (!passwordValue.trim()) {
      showAlert({
        title: 'Authentication',
        message: 'Please enter your password!',
        type: 'error',
      });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login();
    }, 1000);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/background.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFill, styles.overlay]} />

        <Animated.View style={[styles.contentContainer, animatedStyle]}>
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              {/* Back Button */}
              <View style={styles.topBar}>
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={({ pressed }) => [
                    styles.backButton,
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  <Feather name="arrow-left" size={24} color={Colors.white} />
                </Pressable>
              </View>

              <View style={styles.headerContainer}>
                <CompassIcon />
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Enter password for {identifier}</Text>
              </View>

              <View style={styles.formContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  value={passwordValue}
                  onChangeText={setPasswordValue}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus={true}
                />

                <Pressable 
                  onPress={() => showAlert({
                    title: 'Reset Password',
                    message: 'Reset password flow is simulated!',
                    type: 'info',
                  })}
                  style={({ pressed }) => [
                    styles.forgotPasswordLink,
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </Pressable>

                <Pressable 
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && { opacity: 0.85 }
                  ]}
                  disabled={isLoading}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>
                      {isLoading ? 'Signing in...' : 'Log In'}
                    </Text>
                    {!isLoading && (
                      <Feather 
                        name="check" 
                        size={18} 
                        color={Colors.black} 
                        style={styles.buttonIcon} 
                      />
                    )}
                  </View>
                </Pressable>
              </View>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                  Route: SnapStep Login - Password
                </Text>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(10, 15, 25, 0.65)',
  },
  contentContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topBar: {
    height: 48,
    justifyContent: 'center',
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  compassOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(112, 194, 180, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(112, 194, 180, 0.25)',
    marginBottom: 20,
  },
  compassInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(112, 194, 180, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  needleContainer: {
    width: 12,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  needleNorth: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.primary,
  },
  needleSouth: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'rgba(15, 15, 15, 0.85)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  textInput: {
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.black,
    fontWeight: '500',
    marginBottom: 16,
    width: '100%',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  primaryButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '700',
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
