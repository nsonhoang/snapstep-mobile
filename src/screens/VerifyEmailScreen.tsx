import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../navigation/AuthContext';
import { Colors } from '../constants/Colors';
import { VerifyEmailScreenProps } from '../navigation/types';
import { sendEmailVerification, getAuth } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';

export const VerifyEmailScreen = ({ navigation }: VerifyEmailScreenProps): React.JSX.Element => {
  const { user, reloadUser, logout } = useAuth();
  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const nav = useNavigation();

    useEffect(() => {
    const intervalId = setInterval(() => {
      // Gọi hàm reloadUser chạy ngầm
      reloadUser().catch(() => {});
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);




  // Hàm xử lý khi người dùng bấm Đã xác thực
  const handleVerifiedCheck = async () => {
    setIsReloading(true);
    try {
      await reloadUser();
    } catch (error) {
      console.error('Lỗi khi tải lại dữ liệu user:', error);
    } finally {
      setIsReloading(false);
    }
  };

  // Hàm xử lý khi người dùng bấm Gửi lại email
  const handleResendEmail = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;
    
    setIsResending(true);
    try {
      await sendEmailVerification(currentUser);
      // Hiển thị thông báo thành công (có thể thay bằng AlertProvider nếu muốn)
      alert('Đã gửi lại đường link xác thực. Vui lòng kiểm tra hòm thư!');
    } catch (error) {
      console.error('Lỗi khi gửi lại email:', error);
      alert('Không thể gửi lại email lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Ảnh nền */}
      <ImageBackground
        source={require('../../assets/background.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      {/* Lớp phủ màu đen */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          entering={FadeInDown.duration(800).springify()} 
          style={styles.contentContainer}
        >
          {/* Biểu tượng Hộp thư */}
          <View style={styles.iconContainer}>
            <View style={styles.iconInner}>
              <Feather name="mail" size={48} color={Colors.primary} />
            </View>
          </View>

          {/* Tiêu đề & Lời nhắn */}
          <Text style={styles.title}>Xác thực Email</Text>
          <Text style={styles.subtitle}>
            Chúng tôi đã gửi một đường link xác nhận đến email:
          </Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <Text style={styles.instruction}>
            Vui lòng kiểm tra hòm thư (hoặc mục Spam), bấm vào đường link để xác thực, sau đó quay lại đây.
          </Text>

          <View style={styles.buttonGroup}>
            {/* Nút Tôi đã xác thực */}
            <Pressable
              onPress={handleVerifiedCheck}
              disabled={isReloading}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.8 },
                isReloading && { opacity: 0.5 }
              ]}
            >
              {isReloading ? (
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={styles.primaryButtonText}>Tôi đã xác thực xong</Text>
              )}
            </Pressable>

            {/* Nút Gửi lại */}
            <Pressable
              onPress={handleResendEmail}
              disabled={isResending}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.8 },
                isResending && { opacity: 0.5 }
              ]}
            >
              {isResending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.secondaryButtonText}>Gửi lại Email</Text>
              )}
            </Pressable>
          </View>
        </Animated.View>

        {/* Nút Đăng xuất đặt ở góc dưới */}
        <Pressable 
          onPress={logout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && { opacity: 0.7 }
          ]}
        >
          <Feather name="log-out" size={20} color={Colors.textMuted} />
          <Text style={styles.logoutText}>Sử dụng tài khoản khác</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlay: {
    backgroundColor: 'rgba(10, 15, 25, 0.75)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(112, 194, 180, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(112, 194, 180, 0.2)',
  },
  iconInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(112, 194, 180, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'SF-Pro-Rounded-Bold',
    fontSize: 28,
    color: Colors.white,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'SF-Pro-Rounded-Regular',
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    fontFamily: 'SF-Pro-Rounded-Bold',
    fontSize: 18,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  instruction: {
    fontFamily: 'SF-Pro-Rounded-Regular',
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  buttonGroup: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontFamily: 'SF-Pro-Rounded-Bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'SF-Pro-Rounded-Semibold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  logoutText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontFamily: 'SF-Pro-Rounded-Medium',
  },
});
