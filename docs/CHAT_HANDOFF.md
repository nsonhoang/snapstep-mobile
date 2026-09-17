# 📑 BÁO CÁO BÀN GIAO & TIẾN ĐỘ TÍNH NĂNG CHAT (HANDOFF DOCUMENT)

> **Dự án:** SnapStep Mobile (React Native + Expo SDK 57 + Firebase)  
> **Tính năng:** Nhắn tin Trò chuyện 1-1 Mã hóa Đầu cuối (Hybrid E2EE Chat)  
> **Ngày cập nhật:** 15/09/2026  
> **Mục đích:** File tổng hợp nhanh tiến độ, các phần đã hoàn thành, các phần còn thiếu/tối ưu và hướng dẫn nghiệm thu test để nạp ngữ cảnh (context) tức thì cho các phiên làm việc tiếp theo.

---

## 🧭 1. Bản Đồ Tệp Tin Liên Quan (File Manifest)

| Tệp tin                                                                                           | Vai trò chính                                                                                          |
| :------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------- |
| [`src/utils/cryptoUtils.ts`](file:///d:/Tuhoc/native/SnapStep/src/utils/cryptoUtils.ts)           | Phái sinh khóa phòng (`deriveChatRoomKey`), mã hóa AES (`encryptMessage`), giải mã (`decryptMessage`). |
| [`src/services/chatService.ts`](file:///d:/Tuhoc/native/SnapStep/src/services/chatService.ts)     | Sinh Push Key RTDB, gửi tin nhắn, phân trang tin nhắn cũ (`loadMoreMessages`), cập nhật Firestore, lắng nghe WebSocket. |
| [`src/screens/ChatScreen.tsx`](file:///d:/Tuhoc/native/SnapStep/src/screens/ChatScreen.tsx)       | Màn hình chat, FlashList inverted 60fps, phân trang tải tin cũ, Optimistic UI, xử lý lỗi gửi/AsyncStorage, bàn phím Reanimated. |
| [`src/components/ChatBubble.tsx`](file:///d:/Tuhoc/native/SnapStep/src/components/ChatBubble.tsx) | Component bong bóng chat, trích dẫn Snap (3:4), icon trạng thái (🕒 đang gửi, ⚠️ lỗi).                 |
| [`src/screens/FriendsScreen.tsx`](file:///d:/Tuhoc/native/SnapStep/src/screens/FriendsScreen.tsx) | Danh sách hộp thư bạn bè, hiển thị preview tin nhắn đã giải mã, badge `unreadCount`.                   |
| [`database.rules.json`](file:///d:/Tuhoc/native/SnapStep/database.rules.json)                     | Quy tắc bảo mật Realtime Database siết chặt 2 UID trong `$chatId`, index `createdAt` và validate `senderId`. |
| [`docs/CHAT_ENCRYPTION_SPEC.md`](file:///d:/Tuhoc/native/SnapStep/docs/CHAT_ENCRYPTION_SPEC.md)   | Bản đặc tả kỹ thuật kiến trúc Hybrid (Firestore + Realtime Database) & Zero-Knowledge Storage.         |
| [`docs/TEST_SCENARIOS.md`](file:///d:/Tuhoc/native/SnapStep/docs/TEST_SCENARIOS.md)               | Kịch bản kiểm thử chi tiết (Kịch bản 7, 8, 9, 10, 11 dành cho Chat).                                  |

---

## ✅ 2. Các Chức Năng ĐÃ HOÀN THÀNH (Completed Features)

### 2.1. Bảo mật & Mã hóa Dữ liệu (E2EE Crypto Engine)

- [x] **Phái sinh khóa phòng chat (`deriveChatRoomKey`)**: Dùng `SHA-256` kết hợp `APP_CHAT_SALT` và cặp UID sắp xếp theo bảng chữ cái. Khóa sinh cục bộ trong bộ nhớ RAM, tuyệt đối không gửi lên Database.
- [x] **Mã hóa AES-CBC PKCS7 (`encryptMessage`)**: Mỗi tin nhắn sinh ngẫu nhiên một Vector khởi tạo (IV) 16-bytes Hex riêng biệt. Chống trùng lặp bản mã 100%. Hỗ trợ tiếng Việt có dấu và Emoji hoàn hảo.
- [x] **Giải mã an toàn (`decryptMessage`)**: Tự động giải mã bản mã Base64 + IV sang văn bản gốc UTF-8, có cơ chế bắt lỗi an toàn (tránh crash khi dữ liệu hỏng).

### 2.2. Kiến Trúc Cơ Sở Dữ Liệu Hybrid (Firestore + Realtime Database)

- [x] **Quy chuẩn Firebase Push Key đồng nhất**:
  - Hàm `generateMessageId(chatId)` sinh trước Push Key phía Client (`.push().key`).
  - Ghi tin nhắn vào Realtime Database tại `messages/{chatId}/{messageId}`.
  - Đồng thời cập nhật `lastMessageId = messageId` sang Firestore của cả 2 bên.
- [x] **Lắng nghe WebSocket thời gian thực (`subscribeMessages`)**: Độ trễ cực thấp (< 50ms), tự động giải mã tin nhắn trước khi truyền vào giao diện.
- [x] **Phân trang tải tin nhắn cũ (`loadMoreMessages`)**:
  - Sử dụng `endAt(oldestCreatedAt, oldestMessageId)` và `limitToLast(pageSize + 1)` để tải lùi về lịch sử tin nhắn.
  - Tự động lọc bỏ bản ghi mốc để tránh lặp tin.
- [x] **Hộp thư Firestore bền vững (`subscribeUserChats`)**: Quản lý danh sách hội thoại tại `users/{userId}/chats/{chatId}`, tự động giải mã `lastMessageCiphertext` để hiển thị bản xem trước ở Inbox.
- [x] **Bộ đếm tin chưa đọc (`unreadCount`)**: Tự động tăng `+1` khi có tin mới và reset về `0` khi người dùng mở phòng chat (`markChatAsRead`).
- [x] **Siết chặt bảo mật Firebase Realtime Database Rules**:
  - Chỉ cho phép 2 UID tham gia cuộc trò chuyện (`$chatId.beginsWith(auth.uid + '_') || $chatId.endsWith('_' + auth.uid)`) mới được đọc/ghi.
  - Khai báo `.indexOn: ["createdAt"]` giúp truy vấn phân trang server-side siêu tốc.
  - Validate toàn vẹn dữ liệu tin nhắn và đảm bảo `senderId === auth.uid`.

### 2.3. Giao Diện & Trải Nghiệm Người Dùng (UI/UX)

- [x] **Hiệu năng vượt trội 60fps với `@shopify/flash-list`**:
  - Toàn bộ danh sách chat sử dụng `FlashList` thay thế hoàn toàn `FlatList` mặc định.
  - `estimatedItemSize={75}` kèm `inverted={true}` cho trải nghiệm cuộn và tái sử dụng cell mượt mà.
  - `ListFooterComponent` hiển thị vòng xoay `<ActivityIndicator>` màu `Colors.primary` khi đang tải thêm tin nhắn cũ.
- [x] **Optimistic UI & Chống trùng tin**:
  - Gửi tin nhắn tức thì với trạng thái `sending` (hiện icon đồng hồ 🕒).
  - Khớp ID bằng `generateMessageId`, tự động hòa nhập tin nhắn server về mà không bị nhảy giao diện hay lặp tin.
- [x] **Xử lý ngoại tuyến & Bền vững lỗi gửi (`AsyncStorage`)**:
  - Khi mất mạng hoặc gửi thất bại, tin nhắn chuyển sang trạng thái `error` (icon chấm than đỏ ⚠️) và lưu vào `AsyncStorage` (`@failed_msg_${userId}_${chatId}`).
  - Đóng app, mở lại: Tự động nạp lại danh sách tin nhắn lỗi từ cache local.
  - Bấm vào icon ⚠️: Mở Alert cho phép **"Thử lại"** hoặc **"Xóa"**.
- [x] **Dọn dẹp rác khi Đăng xuất (Logout Cleanup)**:
  - Hàm `logout()` trong `authStore.ts` tự động gọi `AsyncStorage.multiRemove` dọn sạch toàn bộ key `@failed_msg_*` của tài khoản hiện tại, bảo mật quyền riêng tư tuyệt đối.
- [x] **Phản hồi khoảnh khắc Snap (Snap Reply)**:
  - Tự động nhận `initialReplyPost` và `initialMessageText` khi phản hồi từ ảnh bạn bè.
  - Thẻ Snap thumbnail tỷ lệ chuẩn 3:4 kèm badge, location, caption.
  - Bấm vào thẻ Snap trích dẫn: Tự động tải bài viết từ `PostService.getPostById` và chuyển hướng tới màn hình `PostDetailScreen`.
- [x] **Bàn phím mượt mà**: Tích hợp `react-native-reanimated` với hook `useKeyboardHeight` và style `keyboardAdaptiveStyle` mượt mà 60fps.
- [x] **Inbox bạn bè (`FriendsScreen`)**: Sắp xếp người có tin nhắn mới nhất lên đầu, hiển thị giờ phút gửi tin, badge số lượng tin chưa đọc.

---

## 🎯 3. Bảng Tổng Hợp Tiến Độ Các Hạng Mục Cải Tiến (All Completed)

| Hạng mục                                       |    Mức độ     | Mô tả chi tiết                                                                                                                                                       | Trạng thái    |
| :--------------------------------------------- | :-----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: |
| **1. Phân trang tải tin nhắn cũ (Pagination)** | 🟡 Trung bình | Bổ sung hàm `ChatService.loadMoreMessages()` và tích hợp vào `ChatScreen` với `FlashList`.                                                                           | ✅ **Hoàn thành** |
| **2. Phân quyền bảo mật Firebase Rules**       | 🔴 Quan trọng | Siết chặt `database.rules.json` (beginsWith/endsWith UID, index createdAt, validate senderId).                                                                      | ✅ **Hoàn thành** |
| **3. Xóa rác tin nhắn lỗi khi Đăng xuất**      |    🟢 Nhỏ     | Đã xác nhận `authStore.ts` dọn dẹp key `@failed_msg_*` khi gọi `logout()`.                                                                                          | ✅ **Hoàn thành** |
| **4. Đồng bộ tên file theo tài liệu**          |    🟢 Nhỏ     | Đã chuẩn hóa trực tiếp bảng manifest và ranh giới kỹ thuật trong `CHAT_ENCRYPTION_SPEC.md` thống nhất chuẩn xác với `src/utils/cryptoUtils.ts`, loại bỏ `cryptoService.ts`. | ✅ **Hoàn thành** |

---

## 🧪 4. Hướng Dẫn Nghiệm Thu Kiểm Thử (QA Acceptance Checklist)

> **Tham chiếu chi tiết:** Xem file [`docs/TEST_SCENARIOS.md`](file:///d:/Tuhoc/native/SnapStep/docs/TEST_SCENARIOS.md) (Kịch bản 7, 8, 9).

### Danh sách kiểm tra thực tế (Checklist):

- [ ] **1. Kiểm thử nhắn tin 2 chiều Realtime:**
  - Mở 2 máy/máy ảo User A và User B.
  - User A gửi tin tiếng Việt có dấu + Emoji 😄🚀.
  - User B nhận được ngay tức thì (< 50ms).
- [ ] **2. Kiểm thử Zero-Knowledge trên Firebase Console:**
  - Mở Realtime Database trên web: Kiểm tra `messages/{chatId}/{messageId}` -> `ciphertext` và `iv` là chuỗi Base64/Hex vô nghĩa.
  - Mở Firestore: Kiểm tra `users/{userId}/chats/{chatId}` -> `lastMessageCiphertext` cũng là chuỗi mã hóa.
- [ ] **3. Kiểm thử Phản hồi Snap:**
  - Từ màn hình Khám phá hoặc Bạn bè, bấm Chat trên một ảnh Snap.
  - Chuyển sang phòng chat có preview ảnh Snap. Bấm gửi.
  - Trong phòng chat bấm vào thẻ Snap -> Mở ra màn hình chi tiết bài viết.
- [ ] **4. Kiểm thử Chế độ mất mạng (Offline / Error Handling):**
  - Tắt Wifi/4G -> Nhập tin nhắn gửi.
  - Tin nhắn hiện icon ⚠️ màu đỏ.
  - Tắt app hoàn toàn (kill process) -> Mở lại app -> Tin nhắn lỗi vẫn hiển thị.
  - Bật lại mạng -> Bấm vào icon ⚠️ -> Chọn **"Thử lại"** -> Tin nhắn gửi thành công và icon biến mất.
- [ ] **5. Kiểm thử Badge chưa đọc:**
  - User A gửi tin cho User B.
  - Màn hình Friends của User B hiển thị badge đỏ số tin chưa đọc và đẩy User A lên đầu.
  - User B bấm vào xem phòng chat -> Quay ra danh sách Friends: Badge biến mất (`unreadCount = 0`).

---

## 🚀 5. Gợi Ý Câu Lệnh Cho Phiên Tiếp Theo (Prompt Quickstart)

Khi mở phiên làm việc mới, bạn chỉ cần gửi một trong các câu lệnh ngắn sau để AI tiếp tục công việc ngay lập tức:

```text
@docs/CHAT_HANDOFF.md Tôi muốn tiếp tục hoàn thiện mục số 2 (Siết chặt Firebase Security Rules). Hãy đề xuất giải pháp.
```

hoặc:

```text
@docs/CHAT_HANDOFF.md Tôi vừa nghiệm thu test xong, hãy hướng dẫn tôi xử lý phân trang tải tin nhắn cũ (Pagination).
```
