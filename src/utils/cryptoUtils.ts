import { AES, SHA256, CBC, Pkcs7, Hex, Utf8, WordArray } from "crypto-es";

/**
 * Muối bí mật (Application Salt) dùng cho việc phái sinh khóa phòng chat
 */
const APP_CHAT_SALT = "SnapStep_E2EE_Secret_Salt_2026_@Secured";

/**
 * Kết quả trả về sau khi mã hóa tin nhắn
 */
export interface EncryptedPayload {
  ciphertext: string; // Chuỗi bản mã định dạng Base64
  iv: string; // Vector khởi tạo dạng chuỗi Hex
}

/**
 * Phái sinh khóa bí mật 256-bit của phòng chat dựa trên UID của 2 người tham gia
 * Khóa này hoàn toàn đồng nhất ở cả 2 thiết bị và không bao giờ lưu lên cơ sở dữ liệu
 *
 * @param uid1 UID của người dùng thứ nhất
 * @param uid2 UID của người dùng thứ hai
 * @returns Chuỗi Hex biểu diễn khóa AES 256-bit
 */
export const deriveChatRoomKey = (uid1: string, uid2: string): string => {
  const sortedPair = [uid1, uid2].sort().join("::");
  const rawSecret = `${sortedPair}::${APP_CHAT_SALT}`;
  return SHA256(rawSecret).toString();
};

/**
 * Mã hóa nội dung tin nhắn văn bản bằng chuẩn AES (hỗ trợ đầy đủ tiếng Việt có dấu & Emoji)
 * Mỗi lần mã hóa luôn sinh một Vector khởi tạo (IV) ngẫu nhiên 16-bytes
 *
 * @param text Nội dung tin nhắn gốc (Plaintext)
 * @param key Khóa phòng chat AES (256-bit Hex)
 * @returns Đối tượng chứa bản mã (ciphertext) và IV ngẫu nhiên
 */
export const encryptMessage = (text: string, key: string): EncryptedPayload => {
  if (!text) {
    return { ciphertext: "", iv: "" };
  }

  // Sinh ngẫu nhiên Vector khởi tạo IV (16 bytes = 128 bits)
  const ivWordArray = WordArray.random(16);
  const ivHex = ivWordArray.toString();

  // Thực hiện mã hóa AES-CBC với PKCS7 padding
  const keyWordArray = Hex.parse(key);
  const encrypted = AES.encrypt(text, keyWordArray, {
    iv: ivWordArray,
    mode: CBC,
    padding: Pkcs7,
  });

  return {
    ciphertext: encrypted.toString(), // Base64
    iv: ivHex,
  };
};

/**
 * Giải mã tin nhắn văn bản từ bản mã và Vector khởi tạo (IV)
 *
 * @param ciphertext Bản mã tin nhắn (chuỗi Base64)
 * @param iv Vector khởi tạo dạng chuỗi Hex
 * @param key Khóa phòng chat AES (256-bit Hex)
 * @returns Nội dung văn bản gốc đã được giải mã
 */
export const decryptMessage = (
  ciphertext: string,
  iv: string,
  key: string
): string => {
  if (!ciphertext) return "";

  try {
    const keyWordArray = Hex.parse(key);
    const ivWordArray = Hex.parse(iv);

    const decrypted = AES.decrypt(ciphertext, keyWordArray, {
      iv: ivWordArray,
      mode: CBC,
      padding: Pkcs7,
    });

    const utf8Text = decrypted.toString(Utf8);
    if (!utf8Text) {
      return "[Không thể giải mã nội dung]";
    }

    return utf8Text;
  } catch (error) {
    console.error("Lỗi khi giải mã tin nhắn:", error);
    return "[Tin nhắn không thể hiển thị]";
  }
};
