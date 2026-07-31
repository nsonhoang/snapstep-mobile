import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface EditProfileAvatarProps {
  imageUrl: string;
  onChangePhoto?: () => void;
}

export const EditProfileAvatar = ({ imageUrl, onChangePhoto }: EditProfileAvatarProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <Pressable onPress={onChangePhoto} style={styles.avatarContainer}>
        <Image
          source={imageUrl}
          style={styles.avatar}
          contentFit="cover"
          transition={300}
        />
        {/* Nút hiển thị biểu tượng máy ảnh đè lên góc dưới bên phải */}
        <View style={styles.cameraOverlay}>
          <MaterialIcons name="photo-camera" size={20} color={Colors.white} />
        </View>
      </Pressable>
      <Pressable onPress={onChangePhoto}>
        <Text style={styles.changeText}>Đổi ảnh đại diện</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background, // Tạo cảm giác khoét viền
  },
  changeText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
