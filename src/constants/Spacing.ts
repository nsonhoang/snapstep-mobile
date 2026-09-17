/**
 * Hệ thống khoảng cách chuẩn 4-point grid (SnapStep Design System)
 * Quy định nhịp điệu khoảng cách (padding, margin, gap) trên toàn ứng dụng di động.
 */
export const Spacing = {
  none: 0,
  xs: 4,    // Khoảng cách siêu nhỏ (gap icon, padding viền nhỏ)
  sm: 8,    // Khoảng cách nhỏ (padding nút nhỏ, gap giữa text phụ)
  md: 16,   // Khoảng cách chuẩn (padding mép màn hình, margin card tiêu chuẩn)
  lg: 24,   // Khoảng cách lớn (khoảng cách giữa các section/phần)
  xl: 32,   // Khoảng cách rất lớn (margin header, khoảng cách banner lớn)
  xxl: 48,  // Khoảng cách cực lớn (phân đoạn trang lớn)
} as const;

export type SpacingKey = keyof typeof Spacing;
