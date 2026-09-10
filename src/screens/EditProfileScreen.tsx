import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateProfile } from '@react-native-firebase/auth';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Colors } from '../constants/Colors';
import { EditProfileScreenProps } from '../navigation/types';
import { EditProfileAvatar } from '../components/EditProfileAvatar';
import { EditProfileSocials } from '../components/EditProfileSocials';
import { EditProfileForm } from '../components/EditProfileForm';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { useAuthStore } from '../stores/authStore';
import { UserService } from '../services/userService';
import { ImageService } from '../services/imageService';
import { ImageUtils } from '../utils/imageUtils';

export const EditProfileScreen = ({ navigation }: EditProfileScreenProps): React.JSX.Element => {
  const { user: authUser, reloadUser } = useAuthStore();

  // State thông tin cá nhân
  const [lastName, setLastName] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  // URL ảnh hiện tại đã lưu trên hệ thống
  const [avatarUrl, setAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=250',
  );

  // State xem trước (Preview) ảnh được chọn từ thiết bị (chưa upload lên Storage)
  const [previewAvatarUri, setPreviewAvatarUri] = useState<string | null>(null);

  // State xem trước avatar preset mẫu (nếu người dùng chọn mẫu)
  const [selectedPresetAvatar, setSelectedPresetAvatar] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState<boolean>(false);
  const [devicePhotos, setDevicePhotos] = useState<MediaLibrary.Asset[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false);

  // URL ảnh đang được hiển thị trên giao diện (ưu tiên preview nếu có)
  const currentDisplayAvatar = previewAvatarUri || selectedPresetAvatar || avatarUrl;

  // Tải thông tin hiện tại của người dùng khi mở màn hình
  useEffect(() => {
    if (!authUser?.uid) return;

    let isMounted = true;
    const loadCurrentProfile = async () => {
      try {
        const profile = await UserService.getUserProfile(authUser.uid);
        if (!isMounted) return;

        const emailPrefix = authUser.email ? authUser.email.split('@')[0] : 'Explorer';

        if (profile) {
          setFirstName(profile.firstName || emailPrefix);
          setLastName(profile.lastName || emailPrefix);
          setUsername(profile.username || emailPrefix);
          setBio(profile.bio || '');
          if (profile.avatarUrl) {
            setAvatarUrl(profile.avatarUrl);
          } else if (authUser.photoURL) {
            setAvatarUrl(authUser.photoURL);
          }
        } else {
          const defaultName = authUser.displayName || emailPrefix;
          setFirstName(defaultName);
          setLastName(defaultName);
          setUsername(emailPrefix);
          if (authUser.photoURL) {
            setAvatarUrl(authUser.photoURL);
          }
        }
      } catch (error) {
        console.error('Lỗi khi tải hồ sơ người dùng:', error);
      }
    };

    loadCurrentProfile();

    return () => {
      isMounted = false;
    };
  }, [authUser]);

  // Mở modal chọn ảnh và tải danh sách ảnh từ thư viện thiết bị
  const handleOpenAvatarPicker = async () => {
    setIsAvatarModalVisible(true);
    setIsLoadingPhotos(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập thư viện',
          'Vui lòng cho phép truy cập thư viện ảnh để có thể chọn ảnh từ thiết bị của bạn.',
        );
        setIsLoadingPhotos(false);
        return;
      }

      const result = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 30,
        sortBy: ['creationTime'],
      });
      setDevicePhotos(result.assets);
    } catch (err) {
      console.error('Lỗi tải ảnh từ thư viện thiết bị:', err);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // Chọn ảnh từ thiết bị: Lấy localUri, nén bằng ImageUtils và hiển thị Preview (CHƯA xóa hoặc upload lên Storage)
  const handleSelectDevicePhoto = async (photo: MediaLibrary.Asset) => {
    try {
      setIsLoadingPhotos(true);
      // 1. Lấy thông tin chi tiết và URI cục bộ thực tế từ thư viện
      const assetInfo = await MediaLibrary.getAssetInfoAsync(photo);
      const localPath = assetInfo.localUri || photo.uri;

      // 2. Nén và tối ưu hóa ảnh bằng C++ Nitro Image
      const compressedUri = await ImageUtils.compressImage(localPath);

      // 3. Cập nhật state preview, đóng modal (tuyệt đối không upload hay xóa lúc này)
      setPreviewAvatarUri(compressedUri);
      setSelectedPresetAvatar(null);
      setIsAvatarModalVisible(false);
    } catch (error) {
      console.error('Lỗi khi chuẩn bị ảnh xem trước:', error);
      // Dự phòng sử dụng thẳng URI nếu nén gặp sự cố
      setPreviewAvatarUri(photo.uri);
      setSelectedPresetAvatar(null);
      setIsAvatarModalVisible(false);
    } finally {
      setIsLoadingPhotos(false);
    }
  };

  // Chọn avatar từ mẫu có sẵn: Chỉ gán xem trước (CHƯA tác động Storage)
  const handleSelectPresetAvatar = (presetUrl: string) => {
    setSelectedPresetAvatar(presetUrl);
    setPreviewAvatarUri(null);
    setIsAvatarModalVisible(false);
  };

  // Hàm xử lý lưu thông tin hồ sơ: Dọn rác Storage + Upload ảnh mới + Lưu Firestore & Auth
  const handleSave = async () => {
    if (!authUser?.uid) {
      Alert.alert('Lỗi', 'Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();

    if (!cleanFirst) {
      Alert.alert('Lỗi', 'Vui lòng nhập Tên của bạn.');
      return;
    }

    setIsSaving(true);
    try {
      const cleanUsername = username.trim().replace(/^@/, '');
      const fullName = cleanLast ? `${cleanLast} ${cleanFirst}` : cleanFirst;

      let finalAvatarUrl = avatarUrl;

      // 1. Nếu người dùng chọn ảnh mới từ thiết bị: Xóa ảnh cũ trên Storage -> Upload ảnh mới
      if (previewAvatarUri) {
        // Xóa ảnh đại diện cũ trên Firebase Storage nếu tồn tại
        if (avatarUrl && avatarUrl.includes('firebase')) {
          console.log('Đang dọn dẹp ảnh đại diện cũ trên Storage:', avatarUrl);
          await ImageService.deleteImage(avatarUrl);
        }

        // Upload ảnh mới đã được nén lên thư mục avatars/{userId}/
        const uploadedUrl = await ImageService.uploadAvatar(previewAvatarUri, authUser.uid);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        } else {
          Alert.alert('Cảnh báo', 'Không thể tải ảnh đại diện lên máy chủ, các thông tin khác vẫn được lưu.');
        }
      } else if (selectedPresetAvatar) {
        // Nếu chuyển sang ảnh mẫu preset: Xóa ảnh cũ trên Storage nếu trước đó là ảnh Firebase
        if (avatarUrl && avatarUrl.includes('firebase')) {
          console.log('Đang xóa ảnh cũ trên Storage khi chuyển sang mẫu preset:', avatarUrl);
          await ImageService.deleteImage(avatarUrl);
        }
        finalAvatarUrl = selectedPresetAvatar;
      }

      // 2. Cập nhật dữ liệu vào Firestore document users/{uid} (ĐẢM BẢO LƯU CHÍNH XÁC avatarUrl)
      await UserService.updateUserProfile(authUser.uid, {
        firstName: cleanFirst,
        lastName: cleanLast,
        username: cleanUsername,
        bio: bio.trim(),
        avatarUrl: finalAvatarUrl,
      });

      // 3. Cập nhật Firebase Auth profile
      await updateProfile(authUser, {
        displayName: fullName,
        photoURL: finalAvatarUrl,
      });

      // 4. Tải lại user trong Zustand store để toàn bộ ứng dụng nhận thông tin mới
      await reloadUser();

      // 5. Cập nhật lại state cục bộ
      setAvatarUrl(finalAvatarUrl);
      setPreviewAvatarUri(null);
      setSelectedPresetAvatar(null);

      setIsSaving(false);
      Alert.alert('Thành công', 'Hồ sơ của bạn đã được cập nhật thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Lỗi khi lưu hồ sơ:', error);
      setIsSaving(false);
      Alert.alert('Lỗi', 'Không thể lưu hồ sơ. Vui lòng thử lại sau.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header điều hướng */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.cancelText}>Hủy</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Chỉnh sửa hồ sơ</Text>
        <Pressable onPress={handleSave} style={styles.headerButton} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.saveText}>Lưu</Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Phần Component Đổi ảnh đại diện (Hiển thị ảnh Preview hoặc ảnh hiện tại) */}
        <View style={styles.avatarSectionWrapper}>
          <EditProfileAvatar
            imageUrl={currentDisplayAvatar}
            onChangePhoto={handleOpenAvatarPicker}
          />
        </View>

        {/* Khối nhập liệu Form thông tin cá nhân */}
        <EditProfileForm
          lastName={lastName}
          onChangeLastName={setLastName}
          firstName={firstName}
          onChangeFirstName={setFirstName}
          username={username}
          onChangeUsername={setUsername}
          bio={bio}
          onChangeBio={setBio}
        />

        {/* Component Liên kết MXH */}
        <EditProfileSocials />
      </ScrollView>

      {/* Modal lựa chọn Avatar: Chọn ảnh từ máy hoặc từ mẫu */}
      <AvatarPickerModal
        visible={isAvatarModalVisible}
        onClose={() => setIsAvatarModalVisible(false)}
        devicePhotos={devicePhotos}
        isLoadingPhotos={isLoadingPhotos}
        selectedPresetAvatar={selectedPresetAvatar}
        previewAvatarUri={previewAvatarUri}
        avatarUrl={avatarUrl}
        onSelectDevicePhoto={handleSelectDevicePhoto}
        onSelectPresetAvatar={handleSelectPresetAvatar}
      />

      {/* Overlay hiển thị trạng thái đang lưu hồ sơ */}
      {isSaving && (
        <View style={styles.savingFullOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.savingFullText}>Đang lưu thay đổi...</Text>
        </View>
      )}
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
    justifyContent: 'space-between',
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
    zIndex: -1,
  },
  headerButton: {
    padding: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  avatarSectionWrapper: {
    position: 'relative',
  },
  savingFullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  savingFullText: {
    color: Colors.white,
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
