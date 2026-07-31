import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { HelpAndSupportScreenProps } from '../navigation/types';
import { CustomInput } from '../components/CustomInput';

type TicketType = 'complaint' | 'help';

export const HelpAndSupportScreen = ({ navigation }: HelpAndSupportScreenProps): React.JSX.Element => {
  const [ticketType, setTicketType] = useState<TicketType>('help');
  const [summary, setSummary] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // Basic validation
    if (!summary || !reason || !description) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường thông tin.');
      return;
    }

    // Call API here...
    Alert.alert('Thành công', 'Yêu cầu của bạn đã được gửi. Chúng tôi sẽ phản hồi trong thời gian sớm nhất!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Trợ giúp & Hỗ trợ</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={styles.descriptionText}>
          Xin chào! Chúng tôi có thể giúp gì cho bạn hôm nay? Vui lòng chọn loại yêu cầu và mô tả chi tiết vấn đề bên dưới.
        </Text>

        {/* Ticket Type Selector */}
        <View style={styles.typeSelectorContainer}>
          <Pressable 
            style={[styles.typeChip, ticketType === 'complaint' && styles.typeChipActive]}
            onPress={() => setTicketType('complaint')}
          >
            <MaterialIcons 
              name="report-problem" 
              size={20} 
              color={ticketType === 'complaint' ? Colors.background : Colors.white} 
            />
            <Text style={[styles.typeText, ticketType === 'complaint' && styles.typeTextActive]}>
              Phàn nàn vấn đề
            </Text>
          </Pressable>

          <Pressable 
            style={[styles.typeChip, ticketType === 'help' && styles.typeChipActive]}
            onPress={() => setTicketType('help')}
          >
            <MaterialIcons 
              name="live-help" 
              size={20} 
              color={ticketType === 'help' ? Colors.background : Colors.white} 
            />
            <Text style={[styles.typeText, ticketType === 'help' && styles.typeTextActive]}>
              Yêu cầu trợ giúp
            </Text>
          </Pressable>
        </View>

        {/* Form Inputs */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nội dung sơ lược</Text>
            <CustomInput
              value={summary}
              onChangeText={setSummary}
              placeholder="VD: Lỗi tải hình ảnh chuyến đi..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lý do</Text>
            <CustomInput
              value={reason}
              onChangeText={setReason}
              placeholder="VD: Hình ảnh không hiển thị khi mạng chậm"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả chi tiết</Text>
            <CustomInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Hãy mô tả chi tiết vấn đề bạn đang gặp phải..."
              multiline
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
          </Pressable>
        </View>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
    padding: 4,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  descriptionText: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    gap: 8,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
  },
  typeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  typeTextActive: {
    color: Colors.background,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginBottom: 8,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
