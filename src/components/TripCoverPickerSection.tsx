import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import { Radius } from '../constants/Radius';
import { Typography } from '../constants/Typography';

export interface TripCoverPickerSectionProps {
  coverImageUri: string;
  isLocalImage: boolean;
  onOpenPicker: () => void;
  onRemoveCover: () => void;
}

/**
 * Component hiển thị và chọn ảnh bìa cho chuyến đi
 * Trích xuất từ CreateTripModal để tinh gọn giao diện và tái sử dụng.
 */
export const TripCoverPickerSection = ({
  coverImageUri,
  isLocalImage,
  onOpenPicker,
  onRemoveCover,
}: TripCoverPickerSectionProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ảnh đại diện chuyến đi</Text>

      {coverImageUri.trim() !== '' ? (
        <View style={styles.previewContainer}>
          <Image
            source={coverImageUri}
            style={styles.previewImage}
            contentFit="cover"
          />
          <View style={styles.actionRow}>
            <Pressable style={styles.changeBtn} onPress={onOpenPicker} hitSlop={8}>
              <MaterialIcons name="edit" size={14} color={Colors.white} />
              <Text style={styles.changeBtnText}>Đổi ảnh</Text>
            </Pressable>

            <Pressable style={styles.removeBtn} onPress={onRemoveCover} hitSlop={8}>
              <MaterialIcons name="close" size={16} color={Colors.white} />
            </Pressable>
          </View>

          {isLocalImage && (
            <View style={styles.localBadge}>
              <MaterialIcons name="cloud-upload" size={12} color={Colors.primary} />
              <Text style={styles.localBadgeText}>Sẽ tải lên khi lưu</Text>
            </View>
          )}
        </View>
      ) : (
        <Pressable style={styles.pickerCard} onPress={onOpenPicker}>
          <View style={styles.pickerIconWrapper}>
            <MaterialIcons
              name="add-photo-alternate"
              size={26}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.pickerTitle}>Chọn ảnh bìa từ thư viện</Text>
          <Text style={styles.pickerSubtitle}>
            Chạm để chọn từ máy hoặc mẫu phong cảnh
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.text,
    fontSize: Typography.subhead.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  previewContainer: {
    position: 'relative',
    height: 150,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  actionRow: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  changeBtnText: {
    color: Colors.white,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  removeBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  localBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  localBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  pickerCard: {
    height: 140,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 6,
  },
  pickerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickerTitle: {
    color: Colors.white,
    fontSize: Typography.subhead.fontSize,
    fontWeight: '600',
  },
  pickerSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.caption.fontSize,
  },
});
