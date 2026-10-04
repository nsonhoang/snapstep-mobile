import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';

interface AnimatedSplashScreenProps {
  /**
   * Callback được gọi khi animation màn hình chờ hoàn thành
   */
  onFinish?: () => void;
}

interface ProgressStep {
  progress: number;
  text: string;
}

// 4 bước nạp dữ liệu từ thiết kế Stitch
const LOADING_STEPS: ProgressStep[] = [
  { progress: 0.28, text: 'Discovering your footprints...' },
  { progress: 0.56, text: 'Syncing travel stamps...' },
  { progress: 0.84, text: 'Warming up explore feeds...' },
  { progress: 1.0, text: 'Welcome aboard, Explorer!' },
];

/**
 * Component AnimatedSplashScreen - Tái hiện trọn vẹn màn hình Splash Screen từ Stitch
 * Sử dụng react-native-reanimated đảm bảo animation mượt mà chuẩn 60fps
 */
export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onFinish }) => {
  // Trạng thái bước nạp dữ liệu
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Reanimated Shared Values
  const containerOpacity = useSharedValue<number>(1);
  const bgScale = useSharedValue<number>(1.05);
  const apertureRotation = useSharedValue<number>(0);
  const pulseOpacity = useSharedValue<number>(0.3);
  const dotScale = useSharedValue<number>(1);
  const progressWidth = useSharedValue<number>(0);

  useEffect(() => {
    // 1. Animation phóng to nền cinematic chậm rãi
    bgScale.value = withTiming(1.15, {
      duration: 8000,
      easing: Easing.out(Easing.quad),
    });

    // 2. Vòng xoay khẩu độ camera liên tục
    apertureRotation.value = withRepeat(
      withTiming(360, {
        duration: 20000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // 3. Hiệu ứng đèn neon mint thở (pulsing aura)
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.25, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // 4. Chấm tròn trạng thái nhấp nháy trên badge
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 600, easing: Easing.ease }),
        withTiming(1, { duration: 600, easing: Easing.ease })
      ),
      -1,
      true
    );

    // 5. Tiến trình chạy thanh loading qua 4 bước
    let stepTimer: ReturnType<typeof setInterval>;
    let step = 0;

    progressWidth.value = withTiming(LOADING_STEPS[0].progress, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    stepTimer = setInterval(() => {
      step++;
      if (step < LOADING_STEPS.length) {
        setCurrentStepIndex(step);
        progressWidth.value = withTiming(LOADING_STEPS[step].progress, {
          duration: 500,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        clearInterval(stepTimer);
        // Khi hoàn thành 100%, chờ 400ms rồi fade out toàn bộ màn hình
        setTimeout(() => {
          containerOpacity.value = withTiming(
            0,
            {
              duration: 450,
              easing: Easing.inOut(Easing.ease),
            },
            (isFinished) => {
              if (isFinished && onFinish) {
                runOnJS(onFinish)();
              }
            }
          );
        }, 400);
      }
    }, 700);

    return () => {
      clearInterval(stepTimer);
    };
  }, []);

  // Style Animated cho nền
  const animatedBgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bgScale.value }],
  }));

  // Style Animated cho vòng xoay khẩu độ
  const animatedApertureStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${apertureRotation.value}deg` }],
  }));

  // Style Animated cho hào quang neon
  const animatedAuraStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Style Animated cho chấm tín hiệu badge
  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  // Style Animated cho thanh tiến trình
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  // Style Animated cho toàn bộ màn hình splash khi biến mất
  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]} pointerEvents="box-none">
      {/* 1. Lớp hình nền Cinematic với hiệu ứng Zoom */}
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedBgStyle]}>
          <ImageBackground
            source={require('../../assets/splash-bg.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Lớp phủ Gradient đa tầng tạo chiều sâu và độ tương phản cao */}
        <LinearGradient
          colors={['rgba(19, 19, 19, 0.85)', 'rgba(14, 14, 14, 0.3)', 'rgba(14, 14, 14, 0.95)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Đèn ánh sáng Neon Mint Bloom Ambient */}
      {/* <Animated.View style={[styles.ambientGlowTop, animatedAuraStyle]} />
      <Animated.View style={[styles.ambientGlowBottom, animatedAuraStyle]} /> */}

      {/* 2. Nội dung chính hiển thị */}
      <View style={styles.contentWrapper}>
        {/* Badge tối giản phía trên */}
        <View style={styles.topBadgeContainer}>
          <View style={styles.topBadge}>
            <Animated.View style={[styles.statusDot, animatedDotStyle]} />
            <Text style={styles.badgeText}>EXPLORE • SNAP • CONNECT</Text>
          </View>
        </View>

        {/* Cụm Hero Trung tâm */}
        <View style={styles.centerHeroUnit}>
          {/* Biểu tượng khẩu độ Camera & Hào quang phát sáng */}
          <View style={styles.emblemContainer}>
            <Animated.View style={[styles.radialAura, animatedAuraStyle]} />
            <View style={styles.emblemGlassCircle}>
              <Animated.View style={animatedApertureStyle}>
                <Svg width={46} height={46} viewBox="0 0 48 48" fill="none">
                  <Circle
                    cx={24}
                    cy={24}
                    r={21}
                    stroke={Colors.primaryBright}
                    strokeWidth={1.8}
                    strokeDasharray="6 4"
                    opacity={0.45}
                  />
                  <Path
                    d="M24 10L36 17M36 17L36 31M36 31L24 38M24 38L12 31M12 31L12 17M12 17L24 10"
                    stroke={Colors.primary}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.85}
                  />
                  <Circle cx={24} cy={24} r={6} stroke={Colors.primaryBright} strokeWidth={2.5} />
                </Svg>
              </Animated.View>
              {/* Điểm sáng tâm rực rỡ */}
              <View style={styles.centerPulsePoint} />
            </View>
          </View>

          {/* Tên thương hiệu SnapStep */}
          <Text style={styles.brandTitle}>
            Snap<Text style={styles.brandTitleHighlight}>Step</Text>
          </Text>

          {/* Slogan */}
          <Text style={styles.primaryTagline}>Every step is a story</Text>
          <Text style={styles.secondaryTagline}>Mỗi bước chân là một câu chuyện</Text>
        </View>

        {/* Thanh Loading & Thông báo trạng thái dưới đáy */}
        <View style={styles.bottomProgressContainer}>
          <Text style={styles.statusText}>{LOADING_STEPS[currentStepIndex].text}</Text>
          <View style={styles.progressBarTrack}>
            <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    backgroundColor: Colors.background,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -50,
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.primary,
    opacity: 0.12,
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: Colors.primaryBright,
    opacity: 0.14,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  topBadgeContainer: {
    width: '100%',
    alignItems: 'center',
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.glassDark,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryBright,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textMuted,
  },
  centerHeroUnit: {
    alignItems: 'center',
    width: '100%',
  },
  emblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  radialAura: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
  },
  emblemGlassCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  centerPulsePoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryBright,
    shadowColor: Colors.primaryBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: Colors.white,
    marginBottom: 6,
    textShadowColor: 'rgba(112, 194, 180, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 18,
  },
  brandTitleHighlight: {
    color: Colors.primaryBright,
  },
  primaryTagline: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: Colors.text,
    marginBottom: 4,
  },
  secondaryTagline: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  bottomProgressContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryBright,
    borderRadius: 2,
  },
});
