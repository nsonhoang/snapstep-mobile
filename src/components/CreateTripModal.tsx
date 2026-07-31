import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Modal, Pressable, TextInput, KeyboardAvoidingView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';

export interface TripData {
  id?: string;
  title: string;
  location: string;
  description: string;
  coverImage?: string;
  schedules: ScheduleItem[];
}

interface CreateTripModalProps {
  visible: boolean;
  onClose: () => void;
  initialData?: TripData;
}

interface ScheduleItem {
  id: string;
  dateTime: string;
  description: string;
}

export const CreateTripModal = ({ visible, onClose, initialData }: CreateTripModalProps): React.JSX.Element => {
  const [tripName, setTripName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Điền dữ liệu nếu đang ở chế độ Chỉnh Sửa
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTripName(initialData.title);
        setLocation(initialData.location);
        setDescription(initialData.description);
        setSchedules(initialData.schedules || []);
      } else {
        setTripName('');
        setLocation('');
        setDescription('');
        setSchedules([]);
      }
    }
  }, [visible, initialData]);

  const addSchedule = () => {
    setSchedules([...schedules, { id: Date.now().toString(), dateTime: '', description: '' }]);
  };

  const updateSchedule = (id: string, field: keyof ScheduleItem, value: string) => {
    setSchedules(schedules.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter(item => item.id !== id));
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{initialData ? 'Chỉnh sửa chuyến đi' : 'Tạo chuyến đi mới'}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={Colors.white} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Ảnh đại diện chuyến đi */}
            <Text style={styles.label}>Ảnh đại diện chuyến đi *</Text>
            <Pressable style={styles.imagePickerButton}>
              <MaterialIcons name="add-photo-alternate" size={32} color={Colors.textMuted} />
              <Text style={styles.imagePickerText}>Nhấn để tải ảnh lên</Text>
            </Pressable>

            {/* Tên hành trình */}
            <Text style={styles.label}>Tên hành trình *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Chinh phục đỉnh Fansipan"
              placeholderTextColor={Colors.textMuted}
              value={tripName}
              onChangeText={setTripName}
            />

            {/* Địa điểm */}
            <Text style={styles.label}>Địa điểm *</Text>
            <View style={styles.inputIconContainer}>
              <MaterialIcons name="location-on" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="Thêm địa điểm (cho phép chọn nhiều)"
                placeholderTextColor={Colors.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Mô tả */}
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

            {/* Lịch trình (Tùy chọn) */}
            <Text style={styles.label}>Lịch trình (Tùy chọn)</Text>

            {schedules.map((schedule, index) => (
              <View key={schedule.id} style={styles.scheduleItem}>
                <View style={styles.scheduleHeader}>
                  <Text style={styles.scheduleTitle}>Trạm dừng {index + 1}</Text>
                  <Pressable onPress={() => removeSchedule(schedule.id)}>
                    <MaterialIcons name="delete-outline" size={20} color={Colors.textMuted} />
                  </Pressable>
                </View>

                {/* Date/Time Picker Mock */}
                <View style={styles.inputIconContainer}>
                  <MaterialIcons name="access-time" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputWithIcon, { marginBottom: 8 }]}
                    placeholder="Chọn ngày / giờ (VD: 12/10 08:00)"
                    placeholderTextColor={Colors.textMuted}
                    value={schedule.dateTime}
                    onChangeText={(text) => updateSchedule(schedule.id, 'dateTime', text)}
                  />
                </View>

                {/* Mô tả hoạt động */}
                <TextInput
                  style={[styles.input, styles.textArea, { height: 80 }]}
                  placeholder="Mô tả hoạt động tại trạm này..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  textAlignVertical="top"
                  value={schedule.description}
                  onChangeText={(text) => updateSchedule(schedule.id, 'description', text)}
                />
              </View>
            ))}

            <Pressable style={styles.addScheduleButton} onPress={addSchedule}>
              <MaterialIcons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addScheduleText}>Thêm ngày / trạm dừng mới</Text>
            </Pressable>

          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </Pressable>
            <Pressable style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Lưu chuyến đi</Text>
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: Value.heightScreen * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: -8, // Kéo gần lại input một chút để cân đối
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: Colors.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIconContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 42,
  },
  textArea: {
    height: 100,
  },
  imagePickerButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePickerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  scheduleItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  addScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  addScheduleText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});
