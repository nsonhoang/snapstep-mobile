import { useUploadQueueStore } from "../stores/queueUploadStore";
import { ImageService } from "./imageService";
import { PostService, Post } from "./postService";
import { UserService } from "./userService";
import { useUserStore } from "../stores/userStore";
import { serverTimestamp } from "@react-native-firebase/firestore";
import { extractProvinceName } from "../utils/extractProvinceName";
import { ImageUtils } from "../utils/imageUtils";
import { useAuthStore } from "../stores/authStore";

export const UploadQueueService = {
  // ĐÂY CHÍNH LÀ WORKER CHẠY NGẦM
  processQueue: async (): Promise<void> => {
    const store = useUploadQueueStore.getState();
    const user = useAuthStore.getState().user;

    // 1. Nếu worker đang bận xử lý bài trước đó thì KHÔNG chạy đè lên nhau
    if (store.isProcessing) {
      console.log("Worker đang bận xử lý task khác...");
      return;
    }

    // 2. Lấy ra bài đang chờ ('pending') đầu tiên theo thứ tự thời gian (FIFO)
    const nextTask = store.tasks.find(
      (t) => t.status === "pending" || t.status === "uploading",
    );
    if (!nextTask) {
      console.log("Hàng đợi trống, Worker đi ngủ 💤");
      return;
    }

    console.log("Worker bắt đầu xử lý task:", nextTask.id);

    // 3. Khóa cờ: Đánh dấu Worker bắt đầu làm việc
    store.setIsProcessing(true);
    store.updateTaskStatus(nextTask.id, "uploading");
    store.updateTaskProgress(nextTask.id, 10);

    let uploadedUrl: string | null = null; // Biến lưu tạm link ảnh
    let newPost: string | null = null; // Biến lưu tạm ID bài viết đã tạo

    try {
      // BƯỚC A: Đẩy ảnh lên Firebase Storage
      if (!user) {
        throw new Error("Người dùng chưa đăng nhập.");
      }
      console.log("Worker đang nén ảnh ngầm bằng C++ Nitro Image...");
      store.updateTaskProgress(nextTask.id, 15);

      const compressedUri = await ImageUtils.compressImage(nextTask.photoUri);

      store.updateTaskProgress(nextTask.id, 35);

      const uploadedUrl = await ImageService.uploadImage(
        compressedUri,
        nextTask.userId,
      );

      if (!uploadedUrl) {
        throw new Error("Không thể tải ảnh lên Storage");
      }

      // Tải ảnh xong ➔ Nhảy tiến trình lên 70%
      store.updateTaskProgress(nextTask.id, 70);

      // BƯỚC B: Ghi bài viết vào Firestore
      const postData: Post = {
        authorId: nextTask.userId,
        imageUrl: uploadedUrl,
        caption: nextTask.caption,
        tripId: nextTask.tripId,
        location: nextTask.location,
        shareToMap: nextTask.shareToMap,
        createdAt: serverTimestamp(),
        updateAt: serverTimestamp(),
        like: 0,
        love: 0,
        hate: 0,
        haha: 0,
      };

      const newPost = await PostService.createPost(postData);

      // BƯỚC C: Mở khóa tỉnh/thành nếu bài viết có vị trí
      if (nextTask.location?.address) {
        const provinceName = extractProvinceName(nextTask.location.address);
        if (provinceName) {
          const cachedUser = useUserStore.getState().users[nextTask.userId];
          const isNewProvince = !cachedUser?.conqueredProvinces?.[provinceName];

          if (isNewProvince) {
            await UserService.updateConqueredProvinces(
              nextTask.userId,
              provinceName,
              newPost,
            );
            useUserStore.setState((state) => ({
              users: {
                ...state.users,
                [user.uid]: {
                  ...state.users[user.uid],
                  conqueredProvinces: {
                    ...state.users[user.uid]?.conqueredProvinces,
                    [provinceName]: {
                      unlockedAt: serverTimestamp(),
                      firstPhotoId: newPost,
                    },
                  },
                  stats: {
                    ...state.users[user.uid]?.stats,
                    conqueredProvincesCount:
                      (state.users[user.uid]?.stats?.conqueredProvincesCount ||
                        0) + 1,
                  },
                },
              },
            }));
          }
        }
      }

      // BƯỚC D: Hoàn tất 100%
      store.updateTaskProgress(nextTask.id, 100);
      store.updateTaskStatus(nextTask.id, "success");
      console.log("Task hoàn tất thành công:", nextTask.id);

      // Tự động dọn dẹp xóa task sau 2 giây
      setTimeout(() => {
        useUploadQueueStore.getState().removeTask(nextTask.id);
      }, 2000);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Worker gặp lỗi khi upload:", err);
      // Đánh dấu lỗi để người dùng có thể ấn "Thử lại"

      if (uploadedUrl && !newPost) {
        console.log(" Xóa ảnh rác trên Storage do chưa tạo được Post...");
        await ImageService.deleteImage(uploadedUrl);
      }

      store.updateTaskStatus(
        nextTask.id,
        "failed",
        err.message || "Tải lên thất bại",
      );

      console.error("Lỗi khi đăng bài viết:", error);
    } finally {
      // 4. Mở khóa cờ: Worker đã làm xong bài này
      useUploadQueueStore.getState().setIsProcessing(false);

      // 5. GỌI LẠI CHÍNH NÓ (Đệ quy): Tìm xem còn bài nào đang pending tiếp theo không để làm nốt
      UploadQueueService.processQueue();
    }
  },
};
