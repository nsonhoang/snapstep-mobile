import React from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import { Radius } from '../constants/Radius';
import { Typography } from '../constants/Typography';

export interface ScheduleItem {
  id: string;
  dateTime: string;
  description: string;
}

export interface TripScheduleSectionProps {
  schedules: ScheduleItem[];
  onAddSchedule: () => void;
  onUpdateSchedule: (id: string, field: keyof ScheduleItem, value: string) => void;
  onRemoveSchedule: (id: string) => void;
}

/**
 * Component quản lý danh sách lịch trình / trạm dừng của chuyến đi
 * Trích xuất từ CreateTripModal để tuân thủ nguyên tắc Single Responsibility.
 */
export const TripScheduleSection = ({
  schedules,
  onAddSchedule,
  onUpdateSchedule,
  onRemoveSchedule,
}: TripScheduleSectionProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Lịch trình (Tùy chọn)</Text>

      {schedules.map((schedule, index) => (
        <View key={schedule.id} style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Trạm dừng {index + 1}</Text>
            <Pressable
              onPress={() => onRemoveSchedule(schedule.id)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Xóa trạm dừng ${index + 1}`}
            >
              <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
            </Pressable>
          </View>

          {/* Thời gian */}
          <View style={styles.inputIconContainer}>
            <MaterialIcons
              name="access-time"
              size={20}
              color={Colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.inputWithIcon, { marginBottom: Spacing.sm }]}
              placeholder="Thời gian (VD: 08:30 ngày 1)"
              placeholderTextColor={Colors.textMuted}
              value={schedule.dateTime}
              onChangeText={(text) => onUpdateSchedule(schedule.id, 'dateTime', text)}
            />
          </View>

          {/* Mô tả hoạt động */}
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả hoạt động tại trạm này..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
            value={schedule.description}
            onChangeText={(text) =>
              onUpdateSchedule(schedule.id, 'description', text)
            }
          />
        </View>
      ))}

      {/* Nút thêm trạm dừng */}
      <Pressable style={styles.addButton} onPress={onAddSchedule} hitSlop={8}>
        <MaterialIcons name="add-circle-outline" size={20} color={Colors.primary} />
        <Text style={styles.addButtonText}>Thêm trạm dừng</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    color: Colors.text,
    fontSize: Typography.subhead.fontSize,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  scheduleCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.outline,
    marginBottom: Spacing.sm + 4,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm + 4,
  },
  scheduleTitle: {
    color: Colors.white,
    fontSize: Typography.subhead.fontSize,
    fontWeight: '600',
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
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: Colors.text,
    borderRadius: Radius.sm + 2,
    padding: 12,
    fontSize: Typography.body.fontSize,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  textArea: {
    height: 80,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: Spacing.sm + 2,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: Typography.subhead.fontSize,
    fontWeight: '600',
  },
});
