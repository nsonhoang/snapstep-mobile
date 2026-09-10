import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library/legacy';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';

// Danh sách các mẫu avatar du lịch đẹp mắt để người dùng chọn nhanh
export const AVATAR_PRESETS: string[] = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=250',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=250',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=250',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250',
];

export interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  devicePhotos: MediaLibrary.Asset[];
  isLoadingPhotos: boolean;
  selectedPresetAvatar: string | null;
  previewAvatarUri: string | null;
  avatarUrl: string;
  onSelectDevicePhoto: (photo: MediaLibrary.Asset) => void;
  onSelectPresetAvatar: (presetUrl: string) => void;
}

/**
 * Component Modal chọn ảnh đại diện từ thư viện máy hoặc bộ preset có sẵn
 */
export const AvatarPickerModal = ({
  visible,
  onClose,
  devicePhotos,
  isLoadingPhotos,
  selectedPresetAvatar,
  previewAvatarUri,
  avatarUrl,
  onSelectDevicePhoto,
  onSelectPresetAvatar,
}: AvatarPickerModalProps): React.JSX.Element => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Header của Modal */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn ảnh đại diện</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={Colors.textMuted} />
            </Pressable>
          </View>

          {/* Mục 1: Chọn ảnh từ thư viện thiết bị */}
          <Text style={styles.modalSubTitle}>Ảnh từ thiết bị của bạn:</Text>
          {isLoadingPhotos ? (
            <View style={styles.loadingPhotosBox}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingPhotosText}>Đang tải ảnh từ máy...</Text>
            </View>
          ) : devicePhotos.length === 0 ? (
            <View style={styles.emptyPhotosBox}>
              <Text style={styles.emptyPhotosText}>Không tìm thấy ảnh trong thư viện máy.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.devicePhotosRow}
            >
              {devicePhotos.map((photo) => (
                <Pressable
                  key={photo.id}
                  onPress={() => onSelectDevicePhoto(photo)}
                  style={styles.devicePhotoItem}
                >
                  <Image
                    source={photo.uri}
                    style={styles.devicePhotoImg}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Mục 2: Mẫu avatar du lịch có sẵn */}
          <Text style={[styles.modalSubTitle, { marginTop: 20 }]}>
            Hoặc chọn avatar du lịch:
          </Text>
          <View style={styles.presetGrid}>
            {AVATAR_PRESETS.map((preset) => {
              const isSelected =
                selectedPresetAvatar === preset ||
                (!selectedPresetAvatar && !previewAvatarUri && avatarUrl === preset);

              return (
                <Pressable
                  key={preset}
                  onPress={() => onSelectPresetAvatar(preset)}
                  style={[styles.presetItem, isSelected && styles.presetItemSelected]}
                >
                  <Image
                    source={preset}
                    style={styles.presetImg}
                    contentFit="cover"
                  />
                  {isSelected && (
                    <View style={styles.presetCheckmark}>
                      <MaterialIcons name="check" size={14} color={Colors.white} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#161616',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: Value.heightScreen * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  modalSubTitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  devicePhotosRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  devicePhotoItem: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  devicePhotoImg: {
    width: '100%',
    height: '100%',
  },
  loadingPhotosBox: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingPhotosText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  emptyPhotosBox: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyPhotosText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  presetItem: {
    width: 54,
    height: 54,
    borderRadius: 27,
    position: 'relative',
  },
  presetItemSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  presetImg: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  presetCheckmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
