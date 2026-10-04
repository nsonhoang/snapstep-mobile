import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTranslation } from '../i18n';

interface ProfileOptionListProps {
  onLogout: () => void;
  navigateToNotification: () => void;
  navigateToEditProfile: () => void;
  navigateToChangePassword: () => void;
  navigateToHelp: () => void;
}

export const ProfileOptionList = ({ onLogout, navigateToNotification, navigateToEditProfile, navigateToChangePassword, navigateToHelp }: ProfileOptionListProps): React.JSX.Element => {
  const { t, language, setLanguage } = useTranslation();

  const handleToggleLanguage = () => {
    const nextLang = language === 'vi' ? 'en' : 'vi';
    setLanguage(nextLang);
  };

  return (
    <View style={styles.list}>
      {/* Tùy chọn chỉnh sửa hồ sơ */}
      <Pressable style={styles.row} onPress={navigateToEditProfile}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="edit" size={22} color={Colors.primary} />
          <Text style={styles.text}>{t.profile.editProfile}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>

      {/* Tùy chọn bảo mật tài khoản */}
      <Pressable style={styles.row} onPress={navigateToChangePassword}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="security" size={22} color={Colors.primary} />
          <Text style={styles.text}>{t.profile.changePassword}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>

      {/* Thông báo */}
      <Pressable style={styles.row} onPress={navigateToNotification}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="notifications" size={22} color={Colors.primary} />
          <Text style={styles.text}>{t.profile.notifications}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>

      {/* Tùy chọn ngôn ngữ */}
      <Pressable style={styles.row} onPress={handleToggleLanguage}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="language" size={22} color={Colors.primary} />
          <Text style={styles.text}>{t.profile.language}</Text>
        </View>
        <View style={styles.rightGroup}>
          <Text style={styles.languageText}>{t.profile.languageName}</Text>
          <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
        </View>
      </Pressable>

      {/* Giúp đỡ */}
      <Pressable style={styles.row} onPress={navigateToHelp}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="help" size={22} color={Colors.primary} />
          <Text style={styles.text}>{t.profile.helpAndSupport}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>

      {/* Đăng xuất */}
      <Pressable style={styles.row} onPress={onLogout}>
        <View style={styles.leftGroup}>
          <MaterialIcons name="logout" size={22} color={Colors.error} />
          <Text style={[styles.text, { color: Colors.error }]}>{t.profile.logOut}</Text>
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
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languageText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
