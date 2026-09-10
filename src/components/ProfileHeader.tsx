import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/Colors';
import { RootStackParamList } from '../navigation/types';

interface ProfileHeaderProps {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  onSettingsPress?: () => void;
}

export const ProfileHeader = ({
  displayName,
  username,
  bio,
  avatarUrl,
  onSettingsPress,
}: ProfileHeaderProps): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Ảnh đại diện mặc định nếu user chưa cập nhật
  const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=250';
  const cleanUsername = username ? username.replace(/^@/, '') : '';

  return (
    <View style={styles.container}>
      {/* Nút cài đặt góc trên cùng */}
      <View style={styles.topBar}>
        <Text style={styles.brandTitle}>SnapStep</Text>
        <Pressable style={styles.settingsBtn} onPress={onSettingsPress}>
          <MaterialIcons name="settings" size={24} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Thông tin cá nhân thật */}
      <View style={styles.infoSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={avatarUrl || defaultAvatar}
            style={styles.avatar}
            contentFit="cover"
            transition={300}
          />
        </View>
        <Text style={styles.displayName}>{displayName || 'SnapStep Explorer'}</Text>
        {cleanUsername ? (
          <Text style={styles.username}>@{cleanUsername}</Text>
        ) : null}
        <Text style={styles.bio}>
          {bio || 'Cùng SnapStep lưu giữ những bước chân khám phá Việt Nam 🇻🇳'}
        </Text>
        
        {/* Nút Chỉnh sửa hồ sơ */}
        <Pressable 
          style={styles.editProfileBtn} 
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.editProfileText}>Chỉnh sửa hồ sơ</Text>
        </Pressable>
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
  displayName: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  username: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  bio: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  editProfileBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    marginBottom: 16,
  },
  editProfileText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
