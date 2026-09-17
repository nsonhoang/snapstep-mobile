import { TextStyle } from 'react-native';
import { Colors } from './Colors';

/**
 * Thang đo kiểu chữ chuẩn (Type Ramp - SnapStep Design System)
 * Định hình kích thước, độ đậm, chiều cao dòng và màu chữ mặc định theo chuẩn Human Interface Guidelines.
 */
export const Typography = {
  largeTitle: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    color: Colors.text,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    color: Colors.text,
  },
  title2: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: Colors.text,
  },
  headline: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    color: Colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    color: Colors.text,
  },
  subhead: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 19,
    color: Colors.textMuted,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    color: Colors.textMuted,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: Colors.textMuted,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof Typography;
