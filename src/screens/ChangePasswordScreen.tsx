import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from '@react-native-firebase/auth';
import { Colors } from '../constants/Colors';
import { ChangePasswordScreenProps } from '../navigation/types';
import { CustomInput } from '../components/CustomInput';

interface AuthError extends Error {
  code?: string;
}

export const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps): React.JSX.Element => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý xác thực mật khẩu cũ và cập nhật mật khẩu mới qua Firebase Auth
  const handleUpdatePassword = async () => {
    // 1. Kiểm tra tính hợp lệ cơ bản
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) {
      Alert.alert('Lỗi', 'Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Xác thực lại danh tính bằng mật khẩu cũ (Re-authentication)
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // 3. Cập nhật mật khẩu mới trên Firebase Auth
      await updatePassword(currentUser, newPassword);

      setIsLoading(false);
      Alert.alert('Thành công', 'Mật khẩu của bạn đã được cập nhật thành công.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setIsLoading(false);
      console.error('Lỗi khi đổi mật khẩu:', error);

      const authErr = error as AuthError;
      if (
        authErr.code === 'auth/wrong-password' ||
        authErr.code === 'auth/invalid-credential' ||
        authErr.code === 'auth/invalid-password'
      ) {
        Alert.alert('Lỗi', 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.');
      } else if (authErr.code === 'auth/weak-password') {
        Alert.alert('Lỗi', 'Mật khẩu mới quá yếu. Vui lòng nhập mật khẩu an toàn hơn.');
      } else if (authErr.code === 'auth/requires-recent-login') {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn. Vui lòng đăng xuất và đăng nhập lại để thực hiện.');
      } else {
        Alert.alert('Lỗi', 'Đã xảy ra sự cố khi đổi mật khẩu. Vui lòng thử lại sau.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={styles.descriptionText}>
          Mật khẩu của bạn phải có ít nhất 6 ký tự và nên bao gồm sự kết hợp giữa số, chữ cái và ký tự đặc biệt để đảm bảo an toàn.
        </Text>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <CustomInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Nhập mật khẩu hiện tại"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <CustomInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <CustomInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
            />
          </View>
        </View>

        {/* Nút cập nhật mật khẩu */}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.submitButton, isLoading && { opacity: 0.7 }]} 
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Cập nhật mật khẩu</Text>
            )}
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
    justifyContent: 'center', // Thay đổi để căn giữa
    paddingHorizontal: 20,
    paddingVertical: 16, // Thay vì paddingTop: 60
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
    lineHeight: 20,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
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
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
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
