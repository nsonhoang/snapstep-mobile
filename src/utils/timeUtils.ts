import { Timestamp, FieldValue } from "@react-native-firebase/firestore";

/**
 * Hàm định dạng thời gian bài viết theo rule:
 * - < 1 phút: "Vừa xong"
 * - < 60 phút: "x phút trước"
 * - < 24 giờ: "x giờ trước"
 * - >= 24 giờ (cùng năm): "Ngày/Tháng" (VD: 15/08)
 * - Khác năm: "Ngày/Tháng/Năm" (VD: 15/08/2023)
 */
export const formatPostTime = (createdAt: Timestamp | FieldValue | undefined | null): string => {
  if (!createdAt) return "Mới đây";

  // Firestore FieldValue (serverTimestamp) chưa có .toDate() khi ở cache
  if (!(createdAt instanceof Timestamp)) {
    // Check nếu nó là một object có thuộc tính toDate (như Timestamp fake)
    if (typeof (createdAt as any).toDate === 'function') {
        const date = (createdAt as any).toDate();
        return calculateTimeDifference(date);
    }
    return "Mới đây";
  }

  const date = createdAt.toDate();
  return calculateTimeDifference(date);
};

const calculateTimeDifference = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  
  if (diffInMinutes < 1) {
    return "Vừa xong";
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }
  
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }
  
  // Lớn hơn 24h
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  const currentYear = now.getFullYear();
  
  if (year === currentYear) {
    return `${day}/${month}`;
  } else {
    return `${day}/${month}/${year}`;
  }
};
