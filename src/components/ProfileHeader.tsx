import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ProfileHeaderProps {
  onSettingsPress?: () => void;
}

export const ProfileHeader = ({ onSettingsPress }: ProfileHeaderProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      {/* Nút cài đặt góc trên cùng */}
      <View style={styles.topBar}>
        <Text style={styles.brandTitle}>SnapStep</Text>
        <Pressable style={styles.settingsBtn} onPress={onSettingsPress}>
          <MaterialIcons name="settings" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Thông tin cá nhân */}
      <View style={styles.infoSection}>
        <View style={styles.avatarContainer}>
          <Image
            source="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=250"
            style={styles.avatar}
            contentFit="cover"
            transition={500}
          />
        </View>
        <Text style={styles.username}>@traveler_viet</Text>
        <Text style={styles.bio}>Exploring the hidden gems of Vietnam 🇻🇳</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandTitle: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  settingsBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
  },
  infoSection: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    padding: 4,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  username: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  bio: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
});
