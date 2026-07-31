import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export const EditProfileSocials = (): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Liên kết mạng xã hội</Text>
      
      {/* Nút liên kết Instagram */}
      <Pressable style={styles.socialBtn}>
        <FontAwesome5 name="instagram" size={20} color={Colors.white} />
        <Text style={styles.socialBtnText}>Thêm Instagram</Text>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>
      
      {/* Nút liên kết TikTok */}
      <Pressable style={styles.socialBtn}>
        <FontAwesome5 name="tiktok" size={20} color={Colors.white} />
        <Text style={styles.socialBtnText}>Thêm TikTok</Text>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 12,
  },
  socialBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
});
