import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ImageBackground,
  TextInput,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { LoginScreenProps } from '../navigation/types';
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

export const LoginScreen = ({ navigation }: LoginScreenProps): React.JSX.Element => {
  const { showAlert } = useAlert();
  const [isPhoneMode, setIsPhoneMode] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContinue = (): void => {
    if (!inputValue.trim()) {
      showAlert({
        title: 'Authentication',
        message: isPhoneMode ? 'Please enter your phone number!' : 'Please enter your email address!',
        type: 'error',
      });
      return;
    }
    // Navigate to separate PasswordScreen passing user input details
    navigation.navigate('Password', { identifier: inputValue, isPhone: isPhoneMode });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ImageBackground
          source={require('../assets/background.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFill, styles.overlay]} />

        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View style={styles.headerContainer}>
                <CompassIcon />
                <Text style={styles.title}>SnapStep</Text>
                <Text style={styles.subtitle}>Your next journey begins here.</Text>
              </View>

              <View style={styles.formContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder={isPhoneMode ? "Phone number" : "Email address"}
                  placeholderTextColor={Colors.textMuted}
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType={isPhoneMode ? "phone-pad" : "email-address"}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <Pressable 
                  onPress={() => {
                    setIsPhoneMode(!isPhoneMode);
                    setInputValue('');
                  }}
                  style={({ pressed }) => [
                    styles.toggleLink,
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  {isPhoneMode ? (
                    <>
                      <Feather name="mail" size={16} color={Colors.primary} style={styles.linkIcon} />
                      <Text style={styles.toggleLinkText}>Use Email instead</Text> 
                    </>
                  ) : (
                    <>
                      <Feather name="smartphone" size={16} color={Colors.primary} style={styles.linkIcon} />
                      <Text style={styles.toggleLinkText}>Use Phone Number instead</Text>
                    </>
                  )}
                </Pressable>

                <Pressable 
                  onPress={handleContinue}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && { opacity: 0.85 }
                  ]}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Continue</Text>
                    <Feather 
                      name="arrow-right" 
                      size={18} 
                      color="#0D0D0D" 
                      style={styles.buttonIcon} 
                    />
                  </View>
                </Pressable>

                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Pressable 
                  style={({ pressed }) => [
                    styles.googleButton,
                    pressed && { opacity: 0.85 }
                  ]}
                  onPress={() => showAlert({
                    title: 'Google Sign-In',
                    message: 'Google Sign-In is simulated!',
                    type: 'info',
                  })}
                >
                  <FontAwesome name="google" size={18} color={Colors.white} style={styles.googleIcon} />
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
                </Pressable>

                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account?</Text>
                  <Pressable 
                    style={({ pressed }) => pressed && { opacity: 0.7 }}
                    onPress={() => showAlert({
                      title: 'Registration',
                      message: 'Sign-Up is simulated!',
                      type: 'info',
                    })}
                  >
                    <Text style={styles.signUpLinkText}>Sign up</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.footerContainer}>
                <Text style={styles.footerText}>
                  Route: SnapStep Login (Travel Background)
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
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
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
  toggleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  linkIcon: {
    marginRight: 8,
  },
  toggleLinkText: {
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
    marginBottom: 24,
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
    color: '#0D0D0D',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: Colors.textMuted,
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  googleButton: {
    height: 56,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 10,
  },
  signUpText: {
    color: Colors.white,
    fontSize: 14,
  },
  signUpLinkText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
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
