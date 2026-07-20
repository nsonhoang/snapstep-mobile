import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../navigation/AuthContext';

export const ProfileScreen = (): React.JSX.Element => {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="person-outline" size={72} color={Colors.primary} />
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Trang cá nhân & Cài đặt tài khoản</Text>

        <Pressable onPress={logout} style={styles.logoutButton}>
          <Feather name="log-out" size={18} color={Colors.white} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.4)',
  },
  logoutText: {
    color: '#FF453A',
    fontSize: 15,
    fontWeight: '600',
  },
});
