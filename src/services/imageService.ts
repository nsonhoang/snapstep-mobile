import {
  getStorage,
  ref,
  putFile,
  getDownloadURL,
  deleteObject,
} from "@react-native-firebase/storage";

export const ImageService = {
  uploadImage: async (
    fileUri: string,
    folder: string,
  ): Promise<string | null> => {
    //folder la id cua user
    try {
      console.log("Bắt đầu đẩy ảnh lên Firebase Storage...");

      const filename = `snapstep_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const path = `snapstep/${folder}/${filename}`;

      // Khởi tạo storage và trỏ reference kiểu mới
      const storage = getStorage();
      const reference = ref(storage, path);

      // Dùng hàm putFile dạng Module
      const task = putFile(reference, fileUri);

      // Lắng nghe tiến trình
      task.on("state_changed", (taskSnapshot) => {
        console.log(
          `${taskSnapshot.bytesTransferred} / ${taskSnapshot.totalBytes}`,
        );
      });

      // Đợi task upload xong
      await task;

      // Dùng hàm getDownloadURL dạng Module
      const url = await getDownloadURL(reference);
      console.log("Upload thành công! Link ảnh:", url);

      return url;
    } catch (error) {
      console.error("Lỗi Upload Firebase Storage:", error);
      return null;
    }
  },

  deleteImage: async (imageUrl: string): Promise<boolean> => {
    if (!imageUrl || !imageUrl.includes("firebase")) return false;

    try {
      const storage = getStorage();
      // Reference thẳng từ cái URL
      const reference = ref(storage, imageUrl);

      // Dùng hàm deleteObject của dạng Module
      await deleteObject(reference);

      console.log("Đã dọn rác thành công:", imageUrl);
      return true;
    } catch (error) {
      console.error("Lỗi xóa ảnh Firebase Storage:", error);
      return false;
    }
  },
};
