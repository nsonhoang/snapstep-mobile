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
import { useAuthStore } from '../stores/authStore';
import { Colors } from '../constants/Colors';
import { VerifyEmailScreenProps } from '../navigation/types';
import { sendEmailVerification, getAuth } from '@react-native-firebase/auth';
import { useTranslation } from '../i18n';
import { useAlert } from '../components/AlertProvider';

export const VerifyEmailScreen = ({
  navigation,
  route,
}: VerifyEmailScreenProps): React.JSX.Element => {
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const { user, reloadUser, logout, resetPassword } = useAuthStore();

  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  // Phân biệt chế độ: 'verify_registration' (xác thực khi đăng ký) hoặc 'reset_password' (khôi phục mật khẩu)
  const mode = route.params?.mode || 'verify_registration';
  const isResetPasswordMode = mode === 'reset_password';

  // Lấy email mục tiêu từ route params hoặc từ thông tin user hiện tại
  const targetEmail = route.params?.email || user?.email || '';

  // Chạy polling kiểm tra trạng thái xác thực chỉ khi đang ở chế độ đăng ký tài khoản
  useEffect(() => {
    if (isResetPasswordMode || !user) return;

    const intervalId = setInterval(() => {
      reloadUser().catch(() => {});
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isResetPasswordMode, user, reloadUser]);

  // Xử lý khi nhấn nút chính
  const handlePrimaryAction = async (): Promise<void> => {
    if (isResetPasswordMode) {
      // Chế độ khôi phục: quay lại màn hình Đăng nhập
      navigation.navigate('Login');
      return;
    }

    // Chế độ xác thực đăng ký: tải lại dữ liệu user để kiểm tra emailVerified
    setIsReloading(true);
    try {
      await reloadUser();
    } catch (error: unknown) {
      console.error('Lỗi khi tải lại dữ liệu user:', error);
    } finally {
      setIsReloading(false);
    }
  };

  // Xử lý khi người dùng bấm nút Gửi lại email
  const handleResendEmail = async (): Promise<void> => {
    setIsResending(true);
    try {
      if (isResetPasswordMode) {
        // Gửi lại email đặt lại mật khẩu
        if (!targetEmail) return;
        await resetPassword(targetEmail);
      } else {
        // Gửi lại email xác thực tài khoản
        const currentUser = getAuth().currentUser;
        if (!currentUser) return;
        await sendEmailVerification(currentUser);
      }

      showAlert({
        title: t.common.success,
        message: t.auth.resendLinkSuccess,
        type: 'success',
      });
    } catch (error: unknown) {
      console.error('Lỗi khi gửi lại email:', error);
      showAlert({
        title: t.common.error,
        message: t.auth.resendLinkError,
        type: 'error',
      });
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
          {/* Biểu tượng Hộp thư / Chìa khóa */}
          <View style={styles.iconContainer}>
            <View style={styles.iconInner}>
              <Feather
                name={isResetPasswordMode ? 'key' : 'mail'}
                size={48}
                color={Colors.primary}
              />
            </View>
          </View>

          {/* Tiêu đề & Lời nhắn đa ngôn ngữ */}
          <Text style={styles.title}>
            {isResetPasswordMode
              ? t.auth.resetPasswordTitle
              : t.auth.verifyEmailTitle}
          </Text>
          <Text style={styles.subtitle}>
            {isResetPasswordMode
              ? t.auth.resetPasswordSubtitle
              : t.auth.verifyEmailSubtitle}
          </Text>
          {targetEmail ? (
            <Text style={styles.emailText}>{targetEmail}</Text>
          ) : null}
          <Text style={styles.instruction}>
            {isResetPasswordMode
              ? t.auth.resetPasswordInstruction
              : t.auth.verifyEmailInstruction}
          </Text>

          <View style={styles.buttonGroup}>
            {/* Nút hành động chính */}
            <Pressable
              onPress={handlePrimaryAction}
              disabled={isReloading}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.8 },
                isReloading && { opacity: 0.5 },
              ]}
            >
              {isReloading ? (
                <ActivityIndicator color={Colors.black} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isResetPasswordMode
                    ? t.auth.backToLoginBtn
                    : t.auth.verifiedDoneBtn}
                </Text>
              )}
            </Pressable>

            {/* Nút Gửi lại Email */}
            <Pressable
              onPress={handleResendEmail}
              disabled={isResending}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && { opacity: 0.8 },
                isResending && { opacity: 0.5 },
              ]}
            >
              {isResending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.secondaryButtonText}>
                  {t.auth.resendEmail}
                </Text>
              )}
            </Pressable>
          </View>
        </Animated.View>

        {/* Nút Đăng xuất ở dưới cùng (chỉ hiển thị ở chế độ xác thực đăng ký khi đang có session) */}
        {!isResetPasswordMode && user ? (
          <Pressable
            onPress={logout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Feather name="log-out" size={20} color={Colors.textMuted} />
            <Text style={styles.logoutText}>{t.auth.logoutOtherAccount}</Text>
          </Pressable>
        ) : (
          <View style={styles.bottomPlaceholder} />
        )}
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
    textAlign: 'center',
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
  bottomPlaceholder: {
    height: 24,
  },
});
