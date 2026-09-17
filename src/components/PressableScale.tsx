import React from 'react';
import { Pressable, StyleProp, ViewStyle, PressableProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Đường cong Easing mượt mà chuẩn expo-animation
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  activeScale?: number;
  disabled?: boolean;
}

/**
 * Nút bấm vi hiệu ứng vật lý co giãn 60fps mượt mà (chạy 100% trên UI thread)
 * Dùng chung cho toàn bộ các nút tương tác, icon bấm, card chọn trong SnapStep.
 */
export const PressableScale = ({
  onPress,
  children,
  style,
  hitSlop = 12,
  activeScale = 0.97,
  disabled = false,
  ...rest
}: PressableScaleProps): React.JSX.Element => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.set(withTiming(activeScale, { duration: 120, easing: EASE_OUT }));
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.set(withTiming(1, { duration: 120, easing: EASE_OUT }));
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={hitSlop}
      pressRetentionOffset={16}
      disabled={disabled}
      {...rest}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};
