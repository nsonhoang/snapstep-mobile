import { loadImage } from 'react-native-nitro-image';

/**
 * Tiện ích xử lý hình ảnh (Nén, Resize, Crop,...)
 * Sử dụng thư viện react-native-nitro-image (C++) để đạt hiệu năng tối đa.
 */
export const ImageUtils = {
  /**
   * Nén và thay đổi kích thước ảnh.
   * Giữ nguyên tỷ lệ khung hình, kích thước tối đa là 1080px.
   *
   * @param filePath Đường dẫn gốc của ảnh (từ Camera hoặc Gallery)
   * @returns Đường dẫn của ảnh sau khi nén (fallback về ảnh gốc nếu lỗi)
   */
  compressImage: async (filePath: string): Promise<string> => {
    try {
      // VisionCamera thường trả về đường dẫn gốc, nếu có prefix 'file://' thì phải bỏ đi
      // vì Nitro Image yêu cầu 'filePath' phải là đường dẫn hệ thống thực (không phải URL)
      const cleanPath = filePath.replace('file://', '');

      // 1. Tải ảnh vào bộ nhớ (bằng C++)
      const image = await loadImage({ filePath: cleanPath });

      // 2. Tính toán kích thước mới (giữ tỷ lệ)
      let newWidth = image.width;
      let newHeight = image.height;
      const MAX_SIZE = 1080;

      if (newWidth > MAX_SIZE || newHeight > MAX_SIZE) {
        const aspect = newWidth / newHeight;
        if (newWidth > newHeight) {
          newWidth = MAX_SIZE;
          newHeight = Math.round(MAX_SIZE / aspect);
        } else {
          newHeight = MAX_SIZE;
          newWidth = Math.round(MAX_SIZE * aspect);
        }
      }

      // 3. Resize ảnh trong bộ nhớ
      const resizedImage = await image.resizeAsync(newWidth, newHeight);

      // 4. Lưu ra file tạm với định dạng JPG, chất lượng 80%
      const compressedPath = await resizedImage.saveToTemporaryFileAsync('jpg', 80);

      // Trả về kèm prefix file:// để thẻ <Image> của React Native có thể hiển thị được
      return `file://${compressedPath}`;
    } catch (error) {
      console.log('Lỗi nén ảnh (ImageUtils):', error);
      // Fallback: Nếu lỗi, vẫn phải trả về đường dẫn có file:// để app không bị mất ảnh gốc
      return filePath.startsWith('file://') ? filePath : `file://${filePath}`;
    }
  },
};
