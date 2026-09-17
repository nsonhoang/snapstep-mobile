/**
 * Hệ thống bo góc chuẩn (SnapStep Design System)
 * Kết hợp cùng borderCurve: "continuous" trên iOS để đạt góc bo mượt mà chuẩn Apple HIG.
 */
export const Radius = {
  none: 0,
  xs: 4,      // Tag nhãn nhỏ, chỉ báo
  sm: 8,      // Ô input nhỏ, nút phụ, chip
  md: 12,     // Card phụ, input tiêu chuẩn
  lg: 16,     // Card chính, modal góc bo tiêu chuẩn
  xl: 24,     // Bottom sheet, popup lớn
  full: 9999, // Nút dạng viên thuốc (Capsule), avatar tròn
} as const;

export type RadiusKey = keyof typeof Radius;
