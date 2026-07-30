import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ProfileOptionListProps {
  onLogout: () => void;
}

export const ProfileOptionList = ({ onLogout }: ProfileOptionListProps): React.JSX.Element => {
  return (
    <View style={styles.list}>
      {/* Tùy chọn chỉnh sửa hồ sơ */}
      <Pressable style={styles.row}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="edit" size={22} color={Colors.primary} />
          <Text style={styles.text}>Edit Profile</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>

      {/* Tùy chọn bảo mật tài khoản */}
      <Pressable style={styles.row}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="security" size={22} color={Colors.primary} />
          <Text style={styles.text}>Account Security</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>

      {/* Sở thích du lịch */}
      <Pressable style={styles.row}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="explore" size={22} color={Colors.primary} />
          <Text style={styles.text}>Travel Preferences</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>

      {/* Thông báo */}
      <Pressable style={styles.row}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="notifications" size={22} color={Colors.primary} />
          <Text style={styles.text}>Notifications</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>

      {/* Đăng xuất */}
      <Pressable style={styles.row} onPress={onLogout}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="logout" size={22} color={Colors.error} />
          <Text style={[styles.text, { color: Colors.error }]}>Log Out</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
