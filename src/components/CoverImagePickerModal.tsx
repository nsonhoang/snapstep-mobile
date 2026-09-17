import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';
import { ImageUtils } from '../utils/imageUtils';
import { useAlert } from './AlertProvider';

// Bộ ảnh bìa phong cảnh du lịch mẫu sắc nét để người dùng chọn nhanh
export const COVER_PRESETS: { id: string; title: string; url: string }[] = [
  {
    id: 'preset_1',
    title: 'Núi non Sa Pa',
    url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800',
  },
  {
    id: 'preset_2',
    title: 'Biển xanh nhiệt đới',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800',
  },
  {
    id: 'preset_3',
    title: 'Rừng thông sương mù',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800',
  },
  {
    id: 'preset_4',
    title: 'Phố cổ về đêm',
    url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800',
  },
  {
    id: 'preset_5',
    title: 'Hoàng hôn rực rỡ',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=800',
  },
  {
    id: 'preset_6',
    title: 'Đèo núi hùng vĩ',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800',
  },
];

export interface CoverImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  // Callback khi chọn ảnh thành công: trả về đường dẫn ảnh và cờ isLocal (true nếu là ảnh máy cần upload)
  onSelectCoverImage: (imageUri: string, isLocal: boolean) => void;
  currentImageUri?: string;
}

/**
 * Component Modal chọn ảnh bìa hành trình từ thư viện thiết bị hoặc bộ sưu tập phong cảnh
 */
export const CoverImagePickerModal = ({
  visible,
  onClose,
  onSelectCoverImage,
  currentImageUri,
}: CoverImagePickerModalProps): React.JSX.Element => {
  const [devicePhotos, setDevicePhotos] = useState<MediaLibrary.Asset[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'device' | 'presets'>('device');
  const { showAlert } = useAlert();

  // Khi modal mở lên, tự động tải danh sách ảnh từ thư viện thiết bị
  useEffect(() => {
    let isMounted = true;

    if (visible) {
      const loadPhotos = async () => {
        setIsLoadingPhotos(true);
        try {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status !== 'granted') {
            showAlert({
              title: 'Quyền truy cập ảnh',
              message: 'Vui lòng cấp quyền truy cập thư viện để chọn ảnh bìa từ thiết bị của bạn.',
              type: 'warning',
            });
            if (isMounted) setIsLoadingPhotos(false);
            return;
          }

          const result = await MediaLibrary.getAssetsAsync({
            mediaType: 'photo',
            first: 60,
            sortBy: ['creationTime'],
          });

          if (isMounted) {
            setDevicePhotos(result.assets);
          }
        } catch (error) {
          console.error('Lỗi khi tải ảnh từ thư viện:', error);
        } finally {
          if (isMounted) {
            setIsLoadingPhotos(false);
          }
        }
      };

      loadPhotos();
    }

    return () => {
      isMounted = false;
    };
  }, [visible]);

  // Xử lý khi người dùng chọn 1 ảnh từ thư viện thiết bị
  const handleSelectDevicePhoto = async (photo: MediaLibrary.Asset) => {
    try {
      setIsProcessing(true);

      // 1. Lấy URI cục bộ thực tế từ thư viện thiết bị
      const assetInfo = await MediaLibrary.getAssetInfoAsync(photo);
      const localPath = assetInfo.localUri || photo.uri;

      // 2. Nén và tối ưu hóa trước bằng C++ Nitro Image
      const compressedUri = await ImageUtils.compressImage(localPath);

      // 3. Trả về cho form cha (đánh dấu là ảnh cục bộ cần Lazy Upload)
      onSelectCoverImage(compressedUri, true);
      onClose();
    } catch (error) {
      console.error('Lỗi chuẩn bị ảnh bìa từ thiết bị:', error);
      // Fallback: Nếu nén lỗi vẫn dùng URI gốc
      onSelectCoverImage(photo.uri, true);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý khi chọn ảnh mẫu có sẵn
  const handleSelectPreset = (url: string) => {
    onSelectCoverImage(url, false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Chọn ảnh bìa hành trình</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <MaterialIcons name="close" size={24} color={Colors.textMuted} />
            </Pressable>
          </View>

          {/* Tab chuyển đổi giữa Thư viện máy & Ảnh mẫu */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === 'device' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('device')}
            >
              <MaterialIcons
                name="photo-library"
                size={18}
                color={activeTab === 'device' ? Colors.white : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'device' && styles.tabTextActive,
                ]}
              >
                Từ thiết bị
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tabButton,
                activeTab === 'presets' && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab('presets')}
            >
              <MaterialIcons
                name="landscape"
                size={18}
                color={activeTab === 'presets' ? Colors.white : Colors.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'presets' && styles.tabTextActive,
                ]}
              >
                Mẫu phong cảnh
              </Text>
            </Pressable>
          </View>

          {/* Đang nén / xử lý ảnh */}
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.processingText}>Đang tối ưu ảnh bìa...</Text>
            </View>
          )}

          {/* Nội dung Tab */}
          {activeTab === 'device' ? (
            isLoadingPhotos ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingText}>Đang đọc thư viện ảnh...</Text>
              </View>
            ) : devicePhotos.length === 0 ? (
              <View style={styles.centerBox}>
                <MaterialIcons
                  name="image-not-supported"
                  size={48}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyText}>
                  Không tìm thấy ảnh hoặc chưa cấp quyền thư viện.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.gridContent}
              >
                <View style={styles.photoGrid}>
                  {devicePhotos.map((photo) => (
                    <Pressable
                      key={photo.id}
                      style={styles.gridItem}
                      onPress={() => handleSelectDevicePhoto(photo)}
                    >
                      <Image
                        source={photo.uri}
                        style={styles.gridImage}
                        contentFit="cover"
                      />
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContent}
            >
              <View style={styles.presetsGrid}>
                {COVER_PRESETS.map((preset) => {
                  const isSelected = currentImageUri === preset.url;
                  return (
                    <Pressable
                      key={preset.id}
                      style={[
                        styles.presetCard,
                        isSelected && styles.presetCardSelected,
                      ]}
                      onPress={() => handleSelectPreset(preset.url)}
                    >
                      <Image
                        source={preset.url}
                        style={styles.presetImage}
                        contentFit="cover"
                      />
                      <View style={styles.presetTitleOverlay}>
                        <Text style={styles.presetTitle} numberOfLines={1}>
                          {preset.title}
                        </Text>
                      </View>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <MaterialIcons
                            name="check"
                            size={16}
                            color={Colors.white}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const PHOTO_SIZE = (Value.widthScreen - 40 - 16) / 3;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
    backgroundColor: '#161616',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: Value.heightScreen * 0.78,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.white,
  },
  gridContent: {
    paddingBottom: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  presetsGrid: {
    gap: 12,
  },
  presetCard: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardSelected: {
    borderColor: Colors.primary,
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetTitleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  presetTitle: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 24,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  processingText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
