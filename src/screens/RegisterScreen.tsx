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
import { Colors } from '../constants/Colors';
import { useAlert } from '../components/AlertProvider';
import { CustomInput } from '../components/CustomInput';
import { RegisterScreenProps } from '../navigation/types';

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

export const RegisterScreen = ({ navigation }: RegisterScreenProps): React.JSX.Element => {
  const { register } = useAuth();
  const { showAlert } = useAlert();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
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

  const handleRegister = async (): Promise<void> => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      showAlert({
        title: 'Registration',
        message: 'Please fill in all fields!',
        type: 'error',
      });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({
        title: 'Registration',
        message: 'Passwords do not match!',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    try {
      await register(email.trim(), password);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
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
              {/* Nút quay lại */}
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
                <Text style={styles.title}>Join SnapStep</Text>
                <Text style={styles.subtitle}>Start sharing your journeys.</Text>
              </View>

              <View style={styles.formContainer}>
                <CustomInput
                  style={styles.textInput}
                  placeholder="Email address"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                
                <CustomInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <CustomInput
                  style={styles.textInput}
                  placeholder="Confirm Password"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />

                <Pressable 
                  onPress={handleRegister}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && { opacity: 0.85 }
                  ]}
                  disabled={isLoading}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Text>
                  </View>
                </Pressable>
              </View>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                  Route: SnapStep Register
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
    marginTop: 0,
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
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
