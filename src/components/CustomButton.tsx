import React from 'react';
import {
  StyleSheet,
  Text,
  Pressable,
  PressableProps,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import { Radius } from '../constants/Radius';
import { Typography } from '../constants/Typography';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface CustomButtonProps extends Omit<PressableProps, 'style'> {
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

/**
 * Component Button chuẩn Design System (SnapStep)
 * Tuân thủ Component Contract: hỗ trợ đầy đủ variants, sizes, states và màu thương hiệu Mint.
 */
export const CustomButton = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  children,
  onPress,
  ...rest
}: CustomButtonProps): React.JSX.Element => {
  const isInteractive = !loading && !disabled;

  // Cấu hình màu chữ và loader theo từng variant
  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return Colors.background; // Chữ đen/charcoal trên nền xanh ngọc Mint
      case 'secondary':
        return Colors.white;
      case 'outline':
      case 'ghost':
        return Colors.primary;
      case 'destructive':
        return Colors.white;
      default:
        return Colors.background;
    }
  };

  const textColor = getTextColor();
  const sizeStyle = styles[`size_${size}`];
  const variantStyle = styles[`variant_${variant}`];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : children ? (
        children
      ) : (
        <Text
          style={[
            styles.baseText,
            styles[`text_${size}`],
            { color: textColor },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </>
  );

  return (
    <Pressable
      disabled={!isInteractive}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        variant !== 'primary' && variantStyle,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={[Colors.primaryBright, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, sizeStyle]}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Kích thước (Sizes)
  size_sm: {
    height: 38,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
  },
  size_md: {
    height: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
  },
  size_lg: {
    height: 56,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
  },
  // Kiểu biến thể (Variants)
  variant_primary: {
    // Được xử lý qua LinearGradient
  },
  variant_secondary: {
    backgroundColor: Colors.surfaceBright,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  variant_outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  variant_destructive: {
    backgroundColor: Colors.error,
  },
  variant_ghost: {
    backgroundColor: Colors.transparent,
  },
  // Trạng thái (States)
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  // Kiểu chữ theo kích cỡ
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  text_sm: {
    fontSize: Typography.footnote.fontSize,
  },
  text_md: {
    fontSize: Typography.body.fontSize,
  },
  text_lg: {
    fontSize: Typography.headline.fontSize,
    letterSpacing: 0.3,
  },
});
