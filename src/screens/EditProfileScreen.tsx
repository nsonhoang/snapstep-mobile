import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { EditProfileScreenProps } from '../navigation/types';
import { EditProfileAvatar } from '../components/EditProfileAvatar';
import { EditProfileSocials } from '../components/EditProfileSocials';
import { CustomInput } from '../components/CustomInput';

export const EditProfileScreen = ({ navigation }: EditProfileScreenProps): React.JSX.Element => {
  // Quản lý state cục bộ cho form
  const [displayName, setDisplayName] = useState('Traveler Viet');
  const [username, setUsername] = useState('traveler_viet');
  const [bio, setBio] = useState('Exploring the hidden gems of Vietnam 🇻🇳');
  
  // Hàm xử lý lưu
  const handleSave = () => {
    // TODO: Gửi dữ liệu mới lên backend hoặc lưu vào State quản lý
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header điều hướng */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.cancelText}>Hủy</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <Pressable onPress={handleSave} style={styles.headerButton}>
          <Text style={styles.saveText}>Lưu</Text>
        </Pressable>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Phần Component Đổi ảnh */}
        <EditProfileAvatar 
          imageUrl="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=250" 
          onChangePhoto={() => console.log("Mở image picker")} 
        />

        {/* Khối nhập liệu */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên hiển thị</Text>
            <CustomInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Nhập tên hiển thị"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên người dùng</Text>
            <CustomInput
              value={username}
              onChangeText={setUsername}
              placeholder="Nhập tên người dùng"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tiểu sử</Text>
            {/* Sử dụng style tùy chỉnh để CustomInput có thể làm ô textArea nhiều dòng */}
            <CustomInput
              style={styles.textArea}
              value={bio}
              onChangeText={setBio}
              placeholder="Giới thiệu về bạn..."
              multiline
              maxLength={150}
            />
            <Text style={styles.charCount}>{bio.length}/150</Text>
          </View>
        </View>

        {/* Component Liên kết MXH */}
        <EditProfileSocials />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Giữ space-between cho 2 nút 2 bên
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    zIndex: -1, // Để không đè lên nút bấm
  },
  headerButton: {
    padding: 8,
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  saveText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 4, // CustomInput đã có sẵn margin bottom 16
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  charCount: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: -8, // CustomInput có marginBottom, ta kéo chữ lên tí
    marginBottom: 16,
  },
});
