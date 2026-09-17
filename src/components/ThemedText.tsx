import React from 'react';
import { Text, TextProps } from 'react-native';
import { Typography, TypographyVariant } from '../constants/Typography';

export interface ThemedTextProps extends TextProps {
  /**
   * Định dạng kiểu chữ theo thang đo chuẩn (Type Ramp)
   * @default 'body'
   */
  variant?: TypographyVariant;
  /**
   * Màu chữ tùy chỉnh (nếu muốn ghi đè màu mặc định của variant)
   */
  color?: string;
}

/**
 * Component hiển thị văn bản chuẩn Design System (SnapStep)
 * Thay thế hoàn toàn việc hardcode fontSize/fontWeight lẻ tẻ trong các màn hình.
 */
export const ThemedText = ({
  variant = 'body',
  color,
  style,
  children,
  ...rest
}: ThemedTextProps): React.JSX.Element => {
  const variantStyle = Typography[variant];
  const customColorStyle = color ? { color } : undefined;

  return (
    <Text style={[variantStyle, customColorStyle, style]} {...rest}>
      {children}
    </Text>
  );
};
