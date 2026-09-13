# 📋 Kịch Bản Kiểm Thử Ứng Dụng SnapStep (Test Scenarios & QA Checklist)

Tài liệu này tổng hợp toàn bộ các kịch bản kiểm thử (Test Cases / Scenarios) cho các luồng nghiệp vụ cốt lõi của ứng dụng SnapStep Mobile, bao gồm: **Camera & Đăng bài, Định vị GPS (Bản đồ Bước chân), Quản lý Quyền hệ thống, Đồng bộ Thống kê Người dùng, Cơ chế Rollback dọn rác Storage, và Hệ thống Nhắn tin 1-1 Mã hóa Đầu cuối (Zero-Knowledge Hybrid Chat)**.

---

## 📌 1. Chuẩn Bị Trước Khi Kiểm Thử (Prerequisites)

* **Thiết bị thử nghiệm:** Điện thoại thật hoặc Máy ảo (Android / iOS) đang chạy qua Expo Dev Client (`npx expo start --dev-client`).
* **Tài khoản:** Đã đăng nhập vào một tài khoản người dùng hợp lệ.
* **Mạng:** Kết nối Internet ổn định (Wifi hoặc 4G/5G).
* **Công cụ hỗ trợ (tùy chọn):** Firebase Console (Firestore Database & Storage) để đối chiếu dữ liệu ngầm.

---

## 🧪 2. Chi Tiết Các Kịch Bản Kiểm Thử

---

### Kịch Bản 1: Đăng ảnh BẬT Chia sẻ Vị trí (Happy Path)
> **Mục tiêu:** Đảm bảo khi bật công tắc chia sẻ vị trí, bài viết được lưu kèm tọa độ GPS đầy đủ, xuất hiện trên bản đồ và tăng chỉ số thống kê.

* **Điều kiện tiên quyết:** Thiết bị đã bật GPS và ứng dụng đã được cấp quyền vị trí.
* **Các bước thực hiện:**
  1. Tại màn hình chính (Camera), bấm nút chụp ảnh.
  2. Modal xem trước ảnh ([PhotoPreviewModal](file:///d:/Tuhoc/native/SnapStep/src/components/PhotoPreviewModal.tsx)) mở lên.
  3. Quan sát mục **"Chia sẻ lên Bản đồ Bước chân"**:
     * Công tắc switch đang ở trạng thái **BẬT (Màu xanh ngọc)**.
     * Dòng trạng thái bên dưới hiển thị icon `📍 [Tên địa chỉ]` thực tế (hoặc spinner *"Đang xác định vị trí..."* khi đang dò GPS).
  4. Nhập nội dung mô tả (Caption) và chọn một Hành trình (Trip).
  5. Bấm nút **"Đăng ảnh"**.

* **Kết quả mong đợi:**
  * [x] Hiển thị thông báo nổi: *"Đăng bài thành công!"*, modal đóng lại.
  * [x] **Trang Cá nhân (Profile):** Chỉ số **SNAPS** (`totalPhotosCount`) tự động tăng **+1** ngay lập tức.
  * [x] **Trang Khám phá (Explore):** Bài viết xuất hiện ở đầu bảng tin, có gắn kèm badge vị trí màu xanh `📍 [Tên địa chỉ]`.
  * [x] **Trang Bản đồ (Map):** Xuất hiện một Marker bước chân tương ứng với vị trí vừa chụp.
  * [x] **Firestore:** Document trong collection `posts` có `shareToMap: true` và `location: { latitude, longitude, address }`.
  * [x] **Hành trình (Trips):** Mảng `postIds` trong document `trips/{tripId}` được tự động thêm `postId` mới.

---

### Kịch Bản 2: Đăng ảnh TẮT Chia sẻ Vị trí (Không lưu tọa độ GPS)
> **Mục tiêu:** Đảm bảo khi người dùng chủ động tắt công tắc chia sẻ vị trí, thông tin vị trí hoàn toàn không được lưu lên máy chủ và bài viết không xuất hiện trên bản đồ.

* **Các bước thực hiện:**
  1. Chụp một bức ảnh mới từ Camera.
  2. Trong modal xem trước ảnh, dùng tay gạt công tắc **"Chia sẻ lên Bản đồ Bước chân"** sang **TẮT**.
  3. Quan sát giao diện:
     * Công tắc switch chuyển sang **màu xám đen**.
     * Dòng trạng thái chuyển thành: *"Vị trí sẽ không được lưu vào bài viết này"*.
  4. Nhập Caption, chọn Hành trình và bấm **"Đăng ảnh"**.

* **Kết quả mong đợi:**
  * [x] Đăng bài thành công mà không gặp bất kỳ lỗi nào.
  * [x] **Trang Cá nhân (Profile):** Chỉ số **SNAPS** vẫn tăng **+1** (do vẫn là ảnh của người dùng).
  * [x] **Trang Khám phá (Explore):** Bài viết **vẫn xuất hiện** bình thường trên bảng tin (nhưng không hiển thị badge vị trí).
  * [x] **Trang Bản đồ (Map):** 👉 **TUYỆT ĐỐI KHÔNG xuất hiện** marker của bài viết này trên bản đồ.
  * [x] **Firestore:** Document bài viết có `shareToMap: false` và `location: null`.

---

### Kịch Bản 3: Xử lý Quyền Vị trí & Cảnh báo Tự động Ẩn
> **Mục tiêu:** Đảm bảo ứng dụng phản hồi an toàn, không bị crash hay treo đứng hình khi người dùng từ chối quyền vị trí.

* **Trường hợp 3.1: Người dùng đã từ chối quyền vị trí từ trước:**
  1. Vào **Cài đặt máy ➔ Ứng dụng ➔ SnapStep ➔ Quyền ➔ Tắt quyền Vị trí** (chọn *"Từ chối"*).
  2. Mở lại app SnapStep, chụp một bức ảnh.
  3. Modal xem trước mở lên với công tắc switch ở trạng thái **TẮT**.
  4. Bấm gạt công tắc switch sang **BẬT**.

* **Kết quả mong đợi:**
  * [x] Công tắc switch tự động gạt ngược về **TẮT**.
  * [x] Thanh thông báo màu xám đen nổi lên: *"Cần cấp quyền truy cập vị trí để chia sẻ lên bản đồ!"*.
  * [x] **Đúng 3 giây sau:** Thanh thông báo tự động mờ dần rồi biến mất hoàn toàn (không bị in lì trên màn hình).

* **Trường hợp 3.2: Người dùng vừa vào Cài đặt cấp quyền rồi quay lại:**
  1. Mở Cài đặt máy ➔ Bật lại quyền vị trí cho app SnapStep.
  2. Quay lại modal xem trước ảnh trong app.
  3. Gạt công tắc switch sang **BẬT**.
  * [x] App lập tức nhận diện quyền mới, switch chuyển sang màu xanh ngọc và kích hoạt dò GPS lấy địa chỉ mà không bị báo lỗi kẹt lại.

---

### Kịch Bản 4: Xóa bài đăng (Trừ thống kê & Dọn rác Firebase Storage)
> **Mục tiêu:** Đảm bảo khi xóa bài viết, chỉ số thống kê giảm đúng -1, mảng postIds trong trip được cập nhật, và file ảnh trên Storage được xóa sạch.

* **Các bước thực hiện:**
  1. Vào trang Cá nhân (Profile) hoặc Khám phá (Explore).
  2. Bấm vào bài viết đã đăng để mở màn hình chi tiết ([PostDetailScreen](file:///d:/Tuhoc/native/SnapStep/src/screens/PostDetailScreen.tsx)).
  3. Bấm vào menu 3 chấm (Cài đặt bài viết) ➔ Chọn **"Xóa bài viết"**.
  4. Hộp thoại xác nhận hiện ra ➔ Bấm **"Xóa"**.

* **Kết quả mong đợi:**
  * [x] Hiển thị thông báo *"Gỡ bài viết thành công"*.
  * [x] Bài viết biến mất khỏi danh sách bài viết.
  * [x] **Trang Cá nhân (Profile):** Chỉ số **SNAPS** (`totalPhotosCount`) tự động **giảm đi -1** ngay lập tức.
  * [x] **Giới hạn số âm:** Nếu xóa hết toàn bộ bài viết, chỉ số dừng lại ở mức `0`, không bao giờ bị âm (-1, -2).
  * [x] **Firebase Storage:** File ảnh liên kết với bài viết bị xóa vĩnh viễn khỏi Storage.
  * [x] **Hành trình (Trips):** `postId` bị gỡ khỏi mảng `postIds` của `trips/{tripId}`.

---

### Kịch Bản 5: Cơ chế Rollback khi Đăng bài thất bại
> **Mục tiêu:** Đảm bảo tính toàn vẹn dữ liệu, không để lại file rác mồ côi trên Firebase Storage nếu quá trình tạo bài viết trên Firestore gặp sự cố.

* **Mô phỏng kiểm thử:** (Có thể ngắt kết nối mạng ngay sau khi ảnh tải xong hoặc dùng test rules).
* **Kết quả mong đợi:**
  * [x] Nếu upload ảnh lên Storage thất bại: Quy trình dừng lại, không tạo document rỗng trên Firestore.
  * [x] Nếu upload ảnh lên Storage thành công nhưng Firestore ghi thất bại: Hệ thống tự động kích hoạt `ImageService.deleteImage(uploadedImageUrl)` để xóa ngay file ảnh vừa up lên Storage.
  * [x] Modal xem trước hiển thị thông báo lỗi màu đỏ: *"Đăng bài thất bại, vui lòng thử lại!"* và tự động ẩn sau 3 giây.

---

### Kịch Bản 6: Bảng Tin Khám Phá (Explore Screen) & Pull-to-Refresh
> **Mục tiêu:** Kiểm tra khả năng hiển thị đầy đủ các loại bài viết và tính năng vuốt làm mới.

* **Các bước thực hiện:**
  1. Mở tab **Khám phá (Explore)**.
  2. Quan sát danh sách bài viết: Cả bài viết **có vị trí** và **tắt vị trí** đều phải hiển thị đầy đủ.
  3. Nhập từ khóa vào ô tìm kiếm:
     * Nhập từ khóa theo nội dung mô tả (Caption) ➔ Kết quả lọc đúng bài viết có caption chứa từ khóa.
     * Nhập từ khóa theo địa danh/tên đường (Address) ➔ Kết quả lọc đúng bài viết có địa chỉ tương ứng.
  4. Bấm vào các chip lọc bạn bè: *"Tất cả"*, *"Me"*, và từng người bạn cụ thể.
  5. Đặt ngón tay ở đầu danh sách, **kéo vuốt màn hình xuống (Pull-to-Refresh)** và thả ra.

* **Kết quả mong đợi:**
  * [x] Vòng xoay RefreshControl xuất hiện, danh sách bài viết được làm mới dữ liệu từ server.
  * [x] Không có bài viết nào bị ẩn oan khi ô tìm kiếm để trống.

---

### Kịch Bản 7: Nhắn Tin Mã Hóa 1-1 (Zero-Knowledge AES-256) & Phản Hồi Snap
> **Mục tiêu:** Đảm bảo tin nhắn được mã hóa AES-256 đối xứng với IV ngẫu nhiên trước khi gửi lên server, hỗ trợ tiếng Việt có dấu, emoji và phản hồi ảnh Snap mượt mà qua Realtime Database.

* **Các bước thực hiện:**
  1. Đăng nhập 2 tài khoản (User A và User B) trên 2 thiết bị/máy ảo.
  2. Tại màn hình Bạn bè (Friends), User A bấm vào User B để mở phòng chat ([ChatScreen](file:///d:/Tuhoc/native/SnapStep/src/screens/ChatScreen.tsx)).
  3. User A nhập tin nhắn chứa tiếng Việt có dấu và Emoji: *"Chào bạn! Hôm nay thời tiết trên đỉnh núi rất đẹp 😄🏔️✨"* rồi bấm nút gửi.
  4. User A vào màn hình Bảng tin Khám phá, bấm nút phản hồi (Chat) trên một ảnh Snap của User B để chuyển sang Chat kèm thẻ trích dẫn ảnh (`ChatReplyPost`).
  5. Bấm gửi tin nhắn phản hồi ảnh.

* **Kết quả mong đợi:**
  * [x] **Realtime UI:** Cả User A và User B đều nhìn thấy tin nhắn xuất hiện tức thì (< 50ms) với đầy đủ nội dung chữ, emoji và thẻ ảnh Snap trích dẫn.
  * [x] **Realtime Database (`messages/{chatId}/{messageId}`):**
    - Khóa `messageId` được sinh tự động bằng Firebase Push Key theo thứ tự thời gian.
    - Trường `ciphertext` lưu trữ chuỗi Base64 mã hóa hoàn toàn vô nghĩa.
    - Trường `iv` lưu chuỗi Hex 16-bytes ngẫu nhiên (mỗi tin một IV riêng).
    - 👉 **Tuyệt đối không lưu plaintext** của tin nhắn trên database.
  * [x] **Cloud Firestore (`users/{userId}/chats/{chatId}`):**
    - Cập nhật `lastMessageCiphertext` và `updatedAt`.
    - `unreadCount` của User B tự động tăng +1, màn hình Bạn bè của User B hiển thị badge đỏ số tin chưa đọc và đẩy User A lên đầu danh sách.
    - Khi User B bấm vào phòng chat với User A: `unreadCount` tự động reset về `0`.

---

### Kịch Bản 8: Quản Lý Trạng Thái Tin Nhắn (Sending / Error) & Lưu Trữ Offline (`AsyncStorage`)
> **Mục tiêu:** Đảm bảo giao diện người dùng hiển thị trạng thái gửi lạc quan (Optimistic UI), nhận diện tức thì khi có lỗi mạng và giữ lại dữ liệu trong AsyncStorage khi đóng app.

* **Trường hợp 8.1: Trạng thái đang gửi (Sending) và Gửi thành công (Sent):**
  1. Trong phòng chat, nhập tin nhắn mới và bấm gửi.
  2. Ngay tức thì, tin nhắn xuất hiện ở đáy danh sách chat với biểu tượng đồng hồ 🕒 (`time-outline`).
  3. [x] Khi Firebase nhận tin xong: Biểu tượng đồng hồ biến mất, tin nhắn hòa vào dòng tin chính thức từ server.

* **Trường hợp 8.2: Gặp sự cố mạng & Lưu trữ vào AsyncStorage:**
  1. Ngắt kết nối mạng trên thiết bị (bật Chế độ máy bay hoặc tắt cả Wifi và Dữ liệu di động).
  2. Nhập tin nhắn: *"Tin nhắn thử nghiệm khi mất mạng"* và bấm Gửi.
  3. Quan sát giao diện:
     * [x] Tin nhắn chuyển sang biểu tượng chấm than cảnh báo màu đỏ ⚠️ (`Colors.error`).
     * [x] Không làm crash app, ô nhập liệu được làm sạch để người dùng tiếp tục thao tác.
  4. Đóng hẳn ứng dụng SnapStep (vuốt tắt app khỏi đa nhiệm - kill process).
  5. Mở lại ứng dụng SnapStep và quay lại đúng phòng chat đó.
  6. Quan sát danh sách tin nhắn:
     * [x] Tin nhắn lỗi vẫn hiển thị nguyên vẹn ở vị trí mới nhất cùng biểu tượng cảnh báo đỏ ⚠️ (được load tự động từ key `@failed_msg_${userId}_${chatId}` trong `AsyncStorage`).

---

### Kịch Bản 9: Thao Tác Với Tin Nhắn Lỗi (Thử Lại / Xóa) & Dọn Dẹp Khi Đăng Xuất (Logout Privacy)
> **Mục tiêu:** Kiểm tra khả năng tương tác xử lý tin nhắn lỗi của người dùng và cơ chế xóa sạch dữ liệu nhạy cảm khi đăng xuất khỏi thiết bị.

* **Trường hợp 9.1: Thử lại (Retry) sau khi có mạng trở lại:**
  1. Bật lại kết nối Internet (Wifi/4G).
  2. Trong phòng chat có tin nhắn lỗi, bấm trực tiếp vào biểu tượng cảnh báo ⚠️.
  3. Hộp thoại thông báo xuất hiện với tiêu đề: *"Tin nhắn chưa gửi được"*, gồm 3 lựa chọn: **"Thử lại"**, **"Xóa"**, **"Hủy"**.
  4. Chọn **"Thử lại"**:
     * [x] Tin nhắn chuyển trạng thái sang biểu tượng đồng hồ 🕒 và thực hiện gửi lại.
     * [x] Gửi thành công lên Firebase RTDB: Biểu tượng biến mất, tin nhắn lỗi tự động được gỡ bỏ khỏi `AsyncStorage`.

* **Trường hợp 9.2: Xóa (Delete) tin nhắn lỗi:**
  1. Tạo một tin nhắn lỗi mới (khi ngắt mạng).
  2. Bấm vào biểu tượng ⚠️ và chọn **"Xóa"**.
  3. [x] Tin nhắn lập tức biến mất khỏi màn hình chat và bị xóa khỏi `AsyncStorage`.

* **Trường hợp 9.3: Bảo vệ quyền riêng tư khi Đăng xuất (Logout Cleanup):**
  1. Để lại một số tin nhắn lỗi chưa gửi trong phòng chat.
  2. Vào Cài đặt / Trang cá nhân ➔ Bấm **Đăng xuất**.
  3. Đăng nhập một tài khoản khác (User C) trên cùng thiết bị này.
  4. Mở phòng chat:
     * [x] Toàn bộ dữ liệu tin nhắn lỗi của tài khoản trước đó đã bị hàm `logout()` xóa sạch bằng `AsyncStorage.multiRemove()`.
     * [x] Người dùng mới tuyệt đối không nhìn thấy bất kỳ tin nhắn lỗi hoặc dữ liệu riêng tư của người dùng cũ.

---

## 🏁 3. Bảng Tóm Tắt Checklist Trước Khi Release (Quick Regression Checklist)

| STT | Hạng mục kiểm tra | Trạng thái | Ghi chú |
|:---:|:---|:---:|:---|
| 1 | Chụp ảnh & Modal hiển thị mượt mà | ⬜ Pass | Không lag, không đơ |
| 2 | Đăng bài có GPS: Hiện đúng địa chỉ & Marker trên Map | ⬜ Pass | `shareToMap: true` |
| 3 | Đăng bài không GPS: Ẩn trên Map, vẫn hiện trên Explore | ⬜ Pass | `shareToMap: false` |
| 4 | Cảnh báo từ chối quyền tự ẩn sau 3 giây | ⬜ Pass | Không in lì trên màn hình |
| 5 | Đăng bài mới: SNAPS trên Profile tăng +1 | ⬜ Pass | Cập nhật Realtime |
| 6 | Xóa bài viết: SNAPS giảm -1 & Xóa ảnh trên Storage | ⬜ Pass | Không bị số âm |
| 7 | Pull-to-Refresh trên Explore hoạt động mượt mà | ⬜ Pass | Tải lại danh sách mới nhất |
| 8 | Nhắn tin mã hóa AES-256: RTDB lưu Ciphertext, giải mã tức thì | ⬜ Pass | Hỗ trợ tiếng Việt & Emoji |
| 9 | Trạng thái tin nhắn: Hiện 🕒 khi gửi, chuyển ⚠️ khi lỗi | ⬜ Pass | Optimistic UI mượt mà |
| 10 | Bền vững tin nhắn lỗi: Đóng app mở lại vẫn nạp từ AsyncStorage | ⬜ Pass | Key `@failed_msg_*` |
| 11 | Tương tác tin lỗi (Thử lại / Xóa) & Xóa sạch khi Đăng xuất | ⬜ Pass | Bảo mật tuyệt đối |
