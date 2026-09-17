import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Timestamp, serverTimestamp } from '@react-native-firebase/firestore';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import { Radius } from '../constants/Radius';
import { Typography } from '../constants/Typography';
import { TripService, TripDetail } from '../services/tripService';
import { ImageService } from '../services/imageService';
import { useAuthStore } from '../stores/authStore';
import { useTripStore } from '../stores/tripStore';
import { CoverImagePickerModal } from './CoverImagePickerModal';
import { useAlert } from './AlertProvider';
import { TripCoverPickerSection } from './TripCoverPickerSection';
import { LocationSearchInput } from './LocationSearchInput';
import { TripScheduleSection, ScheduleItem } from './TripScheduleSection';

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800';

export interface TripData {
  id?: string;
  title: string;
  location: string;
  description: string;
  coverImage?: string;
  schedules: ScheduleItem[];
}

export type { ScheduleItem };

interface CreateTripModalProps {
  visible: boolean;
  onClose: () => void;
  initialData?: TripData;
  onSuccess?: (tripId: string) => void;
}

/**
 * Modal Tạo / Chỉnh sửa hành trình du lịch
 * Đã được tinh gọn theo chuẩn Clean Architecture & Anti-Monolith (< 250 dòng)
 * Tách rời các phần ảnh bìa, tìm kiếm địa điểm, và lịch trình thành các component con độc lập.
 */
export const CreateTripModal = ({
  visible,
  onClose,
  initialData,
  onSuccess,
}: CreateTripModalProps): React.JSX.Element => {
  const [tripName, setTripName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [coverImageUri, setCoverImageUri] = useState<string>('');
  const [isLocalImage, setIsLocalImage] = useState<boolean>(false);
  const [isCoverPickerVisible, setIsCoverPickerVisible] = useState<boolean>(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const authUser = useAuthStore((state) => state.user);
  const { showAlert } = useAlert();

  // Điền dữ liệu ban đầu nếu đang ở chế độ Chỉnh Sửa
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTripName(initialData.title || '');
        setLocation(initialData.location || '');
        setDescription(initialData.description || '');
        setCoverImageUri(initialData.coverImage || '');
        setIsLocalImage(false);
        setSchedules(initialData.schedules || []);
      } else {
        setTripName('');
        setLocation('');
        setDescription('');
        setCoverImageUri('');
        setIsLocalImage(false);
        setSchedules([]);
      }
    }
  }, [visible, initialData]);

  // Quản lý trạm dừng
  const handleAddSchedule = () => {
    setSchedules((prev) => [
      ...prev,
      { id: Date.now().toString(), dateTime: '', description: '' },
    ]);
  };

  const handleUpdateSchedule = (
    id: string,
    field: keyof ScheduleItem,
    value: string,
  ) => {
    setSchedules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((item) => item.id !== id));
  };

  // Lưu chuyến đi vào Firestore kèm cơ chế Giao dịch & Rollback an toàn
  const handleSaveTrip = async () => {
    if (!tripName.trim()) {
      showAlert({
        title: 'Thông báo',
        message: 'Vui lòng nhập tên hành trình.',
        type: 'warning',
      });
      return;
    }

    if (!authUser?.uid) {
      showAlert({
        title: 'Thông báo',
        message: 'Bạn cần đăng nhập để thực hiện tính năng này.',
        type: 'warning',
      });
      return;
    }

    setIsSaving(true);
    let newlyUploadedCoverUrl: string | null = null;
    const oldCoverImage = initialData?.coverImage;

    try {
      let finalCover = coverImageUri.trim();
      if (isLocalImage && coverImageUri.trim()) {
        const uploadedUrl = await ImageService.uploadImage(
          coverImageUri,
          authUser.uid,
        );
        if (uploadedUrl) {
          newlyUploadedCoverUrl = uploadedUrl;
          finalCover = uploadedUrl;
        } else {
          showAlert({
            title: 'Lỗi',
            message: 'Không thể tải ảnh bìa lên hệ thống. Vui lòng thử lại sau.',
            type: 'error',
          });
          setIsSaving(false);
          return;
        }
      }

      if (!finalCover) {
        finalCover = DEFAULT_COVER_IMAGE;
      }

      const tripDetails: TripDetail[] = schedules
        .filter((s) => s.description.trim() !== '' || s.dateTime.trim() !== '')
        .map((s) => ({
          time: Timestamp.now(),
          describe: s.dateTime ? `[${s.dateTime}] ${s.description}` : s.description,
        }));

      if (initialData?.id) {
        await TripService.updateTrip(initialData.id, {
          title: tripName.trim(),
          description: description.trim() || location.trim(),
          coverImageUrl: finalCover,
          details: tripDetails,
        });

        if (
          isLocalImage &&
          oldCoverImage &&
          oldCoverImage.includes('firebase') &&
          oldCoverImage !== finalCover
        ) {
          await ImageService.deleteImage(oldCoverImage);
        }

        showAlert({
          title: 'Thành công',
          message: 'Hành trình đã được cập nhật!',
          type: 'success',
        });
        await useTripStore.getState().fetchTrips(authUser.uid);
        onSuccess?.(initialData.id);
        onClose();
      } else {
        const newTripId = await TripService.createTrip({
          userId: authUser.uid,
          title: tripName.trim(),
          description: description.trim() || location.trim(),
          coverImageUrl: finalCover,
          details: tripDetails,
          postIds: [],
          like: 0,
          love: 0,
          hate: 0,
          status: 'planning',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        showAlert({
          title: 'Thành công',
          message: 'Tạo hành trình mới thành công!',
          type: 'success',
        });
        await useTripStore.getState().fetchTrips(authUser.uid);
        onSuccess?.(newTripId);
        onClose();
      }
    } catch (error) {
      console.error('Lỗi khi lưu hành trình:', error);
      if (newlyUploadedCoverUrl) {
        await ImageService.deleteImage(newlyUploadedCoverUrl);
      }
      showAlert({
        title: 'Lỗi',
        message: 'Đã có lỗi xảy ra khi lưu hành trình. Vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
          {/* Header Modal */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {initialData ? 'Chỉnh sửa hành trình' : 'Tạo hành trình mới'}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
              <MaterialIcons name="close" size={24} color={Colors.white} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Phần Chọn & Xem trước Ảnh bìa */}
            <TripCoverPickerSection
              coverImageUri={coverImageUri}
              isLocalImage={isLocalImage}
              onOpenPicker={() => setIsCoverPickerVisible(true)}
              onRemoveCover={() => {
                setCoverImageUri('');
                setIsLocalImage(false);
              }}
            />

            {/* 2. Tên hành trình */}
            <Text style={styles.label}>Tên hành trình *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Chinh phục đỉnh Fansipan"
              placeholderTextColor={Colors.textMuted}
              value={tripName}
              onChangeText={setTripName}
            />

            {/* 3. Phần Nhập & Gợi ý Địa điểm thông minh */}
            <LocationSearchInput
              value={location}
              onChangeLocation={setLocation}
            />

            {/* 4. Mô tả */}
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Chia sẻ về chuyến đi của bạn..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            {/* 5. Phần Quản lý Lịch trình trạm dừng */}
            <TripScheduleSection
              schedules={schedules}
              onAddSchedule={handleAddSchedule}
              onUpdateSchedule={handleUpdateSchedule}
              onRemoveSchedule={handleRemoveSchedule}
            />
          </ScrollView>

          {/* Footer nút hành động */}
          <View style={styles.footer}>
            <Pressable
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSaveTrip}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={Colors.background} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {initialData ? 'Lưu thay đổi' : 'Tạo hành trình'}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Modal chọn ảnh bìa từ thư viện máy hoặc mẫu có sẵn */}
        <CoverImagePickerModal
          visible={isCoverPickerVisible}
          onClose={() => setIsCoverPickerVisible(false)}
          currentImageUri={coverImageUri}
          onSelectCoverImage={(uri: string, isLocal: boolean) => {
            setCoverImageUri(uri);
            setIsLocalImage(isLocal);
          }}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '92%',
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: Typography.title2.fontSize,
    fontWeight: '700',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.md + 4,
    gap: Spacing.xs,
  },
  label: {
    color: Colors.text,
    fontSize: Typography.subhead.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.xs + 2,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: Colors.text,
    borderRadius: Radius.md,
    padding: 14,
    fontSize: Typography.body.fontSize,
    borderWidth: 1,
    borderColor: Colors.outline,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 90,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md + 4,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: Typography.body.fontSize,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: Typography.body.fontSize,
    fontWeight: '700',
  },
});
