import notifee, { AndroidImportance } from "react-native-notify-kit";
import { Platform } from "react-native";

const CHANNEL_ID = "snapstep_upload_channel";
const NOTIFICATION_ID = "snapstep_upload_progress";

/**
 * Service quản lý hiển thị tiến trình tải ảnh lên bảng thông báo hệ thống (Notification Shade).
 */
export const UploadNotificationService = {
  /**
   * Khởi tạo kênh thông báo (bắt buộc trên Android 8.0+)
   */
  initChannel: async (): Promise<void> => {
    if (Platform.OS !== "android") return;

    try {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: "Tiến trình đăng ảnh",
        importance: AndroidImportance.LOW, // Mức LOW để không phát âm thanh mỗi khi % thay đổi
        vibration: false,
      });
    } catch (error: unknown) {
      console.warn("Lỗi tạo kênh thông báo Notifee:", error);
    }
  },

  /**
   * Hiển thị hoặc cập nhật thanh tiến trình %
   * @param progress Tiến độ từ 0 đến 100
   * @param message Tiêu đề hoặc dòng mô tả bước hiện tại
   */
  showProgress: async (
    progress: number,
    message: string = "Đang đăng bài viết...",
  ): Promise<void> => {
    if (Platform.OS !== "android") return;

    try {
      await notifee.displayNotification({
        id: NOTIFICATION_ID,
        title: "SnapStep",
        body: `${message} (${progress}%)`,
        android: {
          channelId: CHANNEL_ID,
          progress: {
            max: 100,
            current: Math.min(Math.max(progress, 0), 100),
            indeterminate: false,
          },
          ongoing: true, // Không cho người dùng vuốt xóa khi tiến trình đang diễn ra
          onlyAlertOnce: true, // Không rung hay đổ chuông liên tục khi nhảy %
          smallIcon: "ic_launcher",
        },
      });
    } catch (error: unknown) {
      console.warn("Lỗi cập nhật thông báo tiến trình:", error);
    }
  },

  /**
   * Thông báo đăng bài thành công và tự động xóa sau 3 giây
   */
  showSuccess: async (): Promise<void> => {
    if (Platform.OS !== "android") return;

    try {
      await notifee.displayNotification({
        id: NOTIFICATION_ID,
        title: "SnapStep",
        body: "Đăng bài viết thành công! 🎉",
        android: {
          channelId: CHANNEL_ID,
          ongoing: false, // Bỏ khóa để người dùng có thể vuốt xóa
          onlyAlertOnce: true,
          smallIcon: "ic_launcher",
        },
      });

      // Tự động xóa thông báo sau 3 giây
      setTimeout(async () => {
        try {
          await notifee.cancelNotification(NOTIFICATION_ID);
        } catch {
          // Bỏ qua lỗi hủy thông báo nếu đã bị đóng
        }
      }, 3000);
    } catch (error: unknown) {
      console.warn("Lỗi hiển thị thông báo thành công:", error);
    }
  },

  /**
   * Thông báo khi quá trình tải lên bị lỗi
   * @param errorMessage Thông điệp lỗi
   */
  showError: async (errorMessage?: string): Promise<void> => {
    if (Platform.OS !== "android") return;

    try {
      await notifee.displayNotification({
        id: NOTIFICATION_ID,
        title: "SnapStep - Tải lên thất bại",
        body: errorMessage || "Không thể tải bài viết lên. Vui lòng thử lại!",
        android: {
          channelId: CHANNEL_ID,
          ongoing: false,
          smallIcon: "ic_launcher",
        },
      });
    } catch (error: unknown) {
      console.warn("Lỗi hiển thị thông báo thất bại:", error);
    }
  },

  /**
   * Hủy hoặc xóa thông báo tiến trình
   */
  cancel: async (): Promise<void> => {
    if (Platform.OS !== "android") return;

    try {
      await notifee.cancelNotification(NOTIFICATION_ID);
    } catch {
      // Bỏ qua nếu thông báo không tồn tại
    }
  },
};
