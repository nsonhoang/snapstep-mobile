/**
 * ImageService: Chịu trách nhiệm giao tiếp với Backend API liên quan đến hình ảnh.
 * Ví dụ: Upload ảnh lên Cloud (AWS S3, Cloudinary), lấy danh sách ảnh từ server,...
 */
export const ImageService = {
  /**
   * (Dự kiến) Upload ảnh lên Cloud server
   */
  uploadImage: async (fileUri: string) => {
    console.log('Chuẩn bị gọi API upload ảnh:', fileUri);
    // TODO: Viết logic fetch/axios multipart/form-data ở đây trong các task sau
  },
};
