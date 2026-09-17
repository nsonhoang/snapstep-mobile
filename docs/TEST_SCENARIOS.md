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

### Kịch Bản 10: Phân Trang & Cuộn Tải Tin Nhắn Cũ (FlashList Pagination & Infinite Scroll)
> **Mục tiêu:** Đảm bảo khi cuộn ngược lên đỉnh trong phòng chat, ứng dụng gọi tải thêm tin nhắn cũ từ RTDB, giải mã an toàn, hiển thị vòng xoay và nạp mượt mà không nhảy giao diện.

* **Các bước thực hiện:**
  1. Mở một phòng chat đã có sẵn lịch sử trò chuyện (> 25 tin nhắn).
  2. Màn hình khởi tạo chỉ nạp 25 tin nhắn gần nhất để tối ưu tốc độ (< 50ms).
  3. Dùng tay vuốt màn hình cuộn ngược lên trên đỉnh (phía tin nhắn cũ nhất).
  4. Quan sát giao diện khi chạm đỉnh:
     * [x] Vòng xoay nhỏ `<ActivityIndicator>` màu xanh ngọc (`Colors.primary`) xuất hiện ở đỉnh danh sách chat.
     * [x] Hàm `loadMoreMessages()` được kích hoạt, lấy thêm 20 tin nhắn cũ tiếp theo dựa trên mốc `oldestCreatedAt` và `oldestMessageId`.
     * [x] Tin nhắn cũ được giải mã E2EE thành công và nạp nối tiếp vào danh sách.
     * [x] Không xảy ra hiện tượng nhảy giật vị trí cuộn hay trùng lặp tin nhắn.
  5. Tiếp tục cuộn lên đến khi hết toàn bộ tin nhắn trong phòng chat:
     * [x] `hasMore` chuyển sang `false`, spinner biến mất và không gửi thêm bất kỳ truy vấn dư thừa nào lên Firebase.

---

### Kịch Bản 11: Kiểm Thử Phân Quyền Bảo Mật Firebase Realtime Database Rules
> **Mục tiêu:** Đảm bảo chỉ 2 người dùng có UID nằm trong $chatId mới có quyền đọc và gửi tin vào phòng chat.

* **Các bước thực hiện:**
  1. Người dùng A (`uid_A`) và Người dùng B (`uid_B`) trò chuyện trong phòng `uid_A_uid_B`.
  2. Dùng tài khoản Người dùng C (`uid_C`):
     * Cố tình tạo kết nối WebSocket đọc đường dẫn `messages/uid_A_uid_B`.
     * Cố tình gửi tin nhắn vào `messages/uid_A_uid_B`.
* **Kết quả mong đợi:**
  * [x] Firebase Server từ chối ngay lập tức với lỗi `PERMISSION_DENIED`.
  * [x] Người dùng C không thể đọc trộm hay ghi đè bất kỳ dữ liệu nào vào phòng chat của A và B.
  * [x] Người dùng A thử gửi tin nhắn mạo danh với `senderId: "uid_B"`: Firebase từ chối vì không thỏa mãn `.validate: "newData.child('senderId').val() === auth.uid"`.

---

### Kịch Bản 12: Xem Chi Tiết Hành Trình Thật & Hiệu Ứng 60fps Reanimated (SavedTripScreen)
> **Mục tiêu:** Đảm bảo trang chi tiết hành trình tải dữ liệu thật từ Firestore, hiển thị timeline, ảnh check-in thật, chuyển mượt sang PostDetail và hiệu ứng Parallax Header cuộn 60fps mượt mà trên UI thread.

* **Các bước thực hiện:**
  1. Từ trang cá nhân (Profile) tab "Saved Routes" hoặc màn hình "AllSavedTrips", bấm vào một thẻ chuyến đi.
  2. Quan sát quá trình tải:
     * [x] Bộ khung xương Skeleton hiển thị đúng vị trí (ảnh bìa, tiêu đề, các trạm dừng, lưới ảnh).
     * [x] Khi có dữ liệu: Ảnh bìa thật, tiêu đề, mô tả, timeline trạm dừng và lưới ảnh thật xuất hiện.
  3. Thử nghiệm cử chỉ cuộn:
     * [x] Kéo cuộn xuống dưới: Thanh Navigation bar trên cùng chuyển dần sang nền tối (`rgba(18, 18, 18, 0.95)`) và tiêu đề chuyến đi trượt mượt mà lên thanh điều hướng.
     * [x] Kéo vuốt đỉnh xuống (Pull-down): Ảnh bìa phóng to đàn hồi mượt mà (Parallax Zoom) mà không gây giật khung hình.
     * [x] Kéo thả để làm mới (Pull-to-refresh): Dữ liệu chuyến đi và bài viết được đồng bộ mới nhất từ Firestore.
  4. Bấm vào một ảnh check-in trong lưới:
     * [x] Mở màn hình `PostDetail` với đầy đủ thông tin bài viết, caption, số lượt thích và bình luận.
  5. Bấm nút Share:
     * [x] Hộp thoại chia sẻ của hệ điều hành xuất hiện với tiêu đề và mô tả chuyến đi.

---

### Kịch Bản 13: Danh Sách Hành Trình Đã Lưu với Shopify FlashList (AllSavedTripsScreen)
> **Mục tiêu:** Đảm bảo danh sách toàn bộ chuyến đi hiển thị mượt mà qua FlashList, hỗ trợ phân trang tải thêm, pull-to-refresh và vi hiệu ứng chạm vật lý 60fps.

* **Các bước thực hiện:**
  1. Nhấn nút "Xem thêm..." ở tab "Saved Routes" trên trang cá nhân hoặc mở từ menu.
  2. Màn hình "AllSavedTripsScreen" nạp danh sách chuyến đi từ `useTripStore` (`TripService.getTrips`).
  3. Thao tác trên danh sách:
     * [x] Danh sách cuộn cực kỳ mượt mà 60fps nhờ Shopify FlashList.
     * [x] Nhấn vào thẻ chuyến đi: Có vi hiệu ứng đàn hồi nhẹ (`scale: 0.98` trong 120ms) và chuyển sang `SavedTripScreen`.
     * [x] Kéo cuộn xuống dưới cùng: Gọi `fetchMoreTrips` tải thêm các chuyến đi cũ hơn (nếu có) kèm spinner tải.
     * [x] Kéo vuốt xuống từ đỉnh: Kích hoạt `RefreshControl` màu xanh ngọc (`Colors.primary`), tải mới lại danh sách.
  4. Trường hợp tài khoản chưa có chuyến đi nào:
     * [x] Hiển thị Empty state đẹp mắt kèm thông điệp khích lệ người dùng khám phá.

---

### Kịch Bản 14: Tạo Mới & Chỉnh Sửa Hành Trình Trực Tiếp Trên Firestore (CreateTripModal)
> **Mục tiêu:** Đảm bảo việc thêm hoặc sửa thông tin chuyến đi được lưu chính xác vào Firestore, tự động cập nhật store và hiển thị tức thì trên giao diện.

* **Các bước thực hiện:**
  1. Nhấn nút "Chuyến đi mới" ở màn hình AllSavedTripsScreen hoặc nút "Edit" trên SavedTripScreen.
  2. Modal `CreateTripModal` trượt lên từ đáy màn hình.
  3. Điền thông tin:
     * Tên hành trình (bắt buộc).
     * Địa điểm / Mô tả.
     * Thêm các trạm dừng lịch trình (Thời gian + Hoạt động).
  4. Bấm nút "Lưu chuyến đi" (hoặc "Cập nhật"):
     * [x] Hiển thị spinner loading trên nút bấm, các trường bị khóa tạm thời.
     * [x] Dữ liệu được ghi vào Firestore collection `trips` với `userId` của tài khoản hiện tại.
     * [x] Modal tự động đóng lại.
     * [x] Danh sách hành trình trong `useTripStore` và màn hình chi tiết được cập nhật ngay lập tức.

### Kịch Bản 15: Chọn Ảnh Bìa Từ Thư Viện, Cơ Chế Lazy Upload & Giao Dịch Rollback An Toàn (CreateTripModal)
> **Mục tiêu:** Kiểm tra trải nghiệm chọn ảnh bìa từ thư viện máy bằng `expo-media-library`, nén bằng C++ Nitro Image, xem trước tức thì, cơ chế Lazy Upload và cơ chế giao dịch 2 pha (2-Phase Commit & Rollback) khi cập nhật hành trình.

* **Các bước thực hiện:**
  1. Mở modal `CreateTripModal` (tạo chuyến đi mới hoặc chỉnh sửa).
  2. Tại mục "Ảnh đại diện chuyến đi", bấm vào khung **"Chọn ảnh bìa từ thư viện"**.
  3. Modal `CoverImagePickerModal` mở lên:
     * [x] Hiển thị lưới ảnh thiết bị (3 cột) lấy từ `expo-media-library`.
     * [x] Chuyển qua tab "Mẫu phong cảnh": Hiển thị các preset danh lam thắng cảnh chất lượng cao.
  4. Chọn 1 bức ảnh từ thư viện máy:
     * [x] Hiển thị chỉ báo "Đang tối ưu ảnh bìa..." trong tích tắc nhờ C++ Nitro Modules.
     * [x] Ảnh hiển thị xem trước ngay lập tức trên banner 16:9 với huy hiệu *"Sẽ tải lên khi lưu"*.
     * [x] Firebase Storage **CHƯA** nhận bất kỳ file nào (Lazy Upload).
  5. Nếu bấm nút Hủy / Đóng modal:
     * [x] Không upload gì lên Storage, không sinh file rác mồ côi.
  6. Khi bấm nút **"Cập nhật"** (hoặc "Lưu chuyến đi") - **Kiểm tra Giao dịch Thành công:**
     * [x] Ảnh mới được upload lên Firebase Storage `snapstep/{userId}/...`.
     * [x] Firestore cập nhật thành công với link ảnh mới.
     * [x] **Dọn rác an toàn:** Ảnh cũ trên Firebase Storage (`oldCoverImage`) được tự động xóa vĩnh viễn sau khi Firestore thành công.
  7. **Kiểm tra Cơ chế Rollback (Nếu Firestore lỗi giữa chừng):**
     * [x] Ảnh cũ trên Storage **vẫn còn nguyên 100%** (vì lệnh xóa ảnh cũ chỉ chạy sau khi Firestore thành công).
     * [x] Ảnh mới vừa tải lên được tự động xóa ngay lập tức (`ImageService.deleteImage`) để không để lại rác mồ côi trên Storage.
     * [x] Dữ liệu chuyến đi và ảnh bìa cũ trên Firestore được bảo toàn trọn vẹn.

### Kịch Bản 16: Tự Động Lấy Vị Trí Hiện Tại Bằng GPS Qua Hook useLocation (CreateTripModal)
> **Mục tiêu:** Đảm bảo trường Địa điểm trong CreateTripModal tái sử dụng hiệu quả hook `useLocation`, lấy tọa độ GPS thực tế và tự động dịch ra địa chỉ cụ thể (`reverseGeocodeAsync`).

* **Các bước thực hiện:**
  1. Mở modal `CreateTripModal` (tạo chuyến đi mới hoặc chỉnh sửa).
  2. Bấm vào nút **"Vị trí hiện tại"** bên cạnh tiêu đề Địa điểm:
     * [x] Nút chuyển sang hiển thị vòng xoay `ActivityIndicator`.
     * [x] Hook `useLocation` kích hoạt `refetchLocation()`.
     * [x] Lấy tọa độ GPS thiết bị và dịch ngược thành công ra tên địa danh chi tiết (ví dụ: *"Ba Đình, Hà Nội"*).
     * [x] Chuỗi địa chỉ tự động được điền vào ô `location`.
  3. Khi ô địa điểm có nội dung:
     * [x] Xuất hiện nút xóa nhanh ("x") bên phải ô nhập.
     * [x] Bấm nút "x" ➔ Ô địa điểm được xóa sạch ngay lập tức để người dùng có thể gõ hoặc lấy lại vị trí khác.
  4. Nếu thiết bị tắt GPS hoặc từ chối quyền:
     * [x] Hiển thị thông báo `showAlert` tùy biến dạng `warning`: *"Quyền truy cập vị trí bị từ chối..."*.


### Kịch Bản 17: Tìm Kiếm Gợi Ý Địa Điểm Tự Động (Autocomplete) & Chống Rate Limit Bằng Debounce
> **Mục tiêu:** Đảm bảo khi gõ vào ô địa điểm trong CreateTripModal, hệ thống tự động đưa ra danh sách đề xuất địa chỉ thực tế (Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP) với cơ chế Debounce 400ms và AbortController để ngăn ngừa hoàn toàn rate limit API. Đồng thời khi hệ thống GPS của thiết bị không phân giải được địa chỉ, API fallback tự động dịch ngược tọa độ thành tên đường phố cụ thể.

* **Các bước thực hiện:**
  1. Mở modal `CreateTripModal`.
  2. Bấm vào ô input **"Địa điểm"** và gõ từ khóa (ví dụ: *"Hồ Gươm"*, *"Sa Pa"*, *"Nguyễn Huệ"*):
     * [x] Trong lúc gõ liên tục, API chưa được gọi ngay nhằm tiết kiệm tài nguyên và tránh rate limit.
     * [x] Sau 400ms dừng gõ (Debounce), xuất hiện spinner loading *"Đang tìm kiếm gợi ý địa điểm..."*.
     * [x] Trả về danh sách gợi ý địa điểm chuẩn tiếng Việt định dạng `[Đường/Địa danh], [Phường/Xã], [Quận/Huyện], [Tỉnh/TP]`.
  3. Chạm vào 1 mục gợi ý trong danh sách:
     * [x] Không bị bàn phím chặn hay nuốt tương tác (`keyboardShouldPersistTaps="handled"`).
     * [x] Toàn bộ địa chỉ đầy đủ được điền vào ô input.
     * [x] Danh sách gợi ý tự động ẩn đi.
  4. Kiểm tra GPS trên thiết bị Android:
     * [x] Bấm nút "Vị trí hiện tại": Nếu geocoder mặc định của thiết bị trả về "Vị trí không xác định", hệ thống tự động kích hoạt `LocationSearchService.reverseGeocode` để lấy tên đường phố chuẩn xác.


### Kịch Bản 18: Bộ Quy Chuẩn Design System Tokens & Component Contract Chuẩn Hóa
> **Mục tiêu:** Đảm bảo toàn bộ ứng dụng tuân thủ nghiêm ngặt hệ thống Design Tokens (`Colors`, `Spacing`, `Typography`, `Radius`) và các thành phần giao diện tái sử dụng (`ThemedText`, `PressableScale`, `CustomButton`) hoạt động trơn tru với hiệu ứng chạm 60fps trên UI thread.

* **Các bước thực hiện:**
  1. Kiểm tra bộ token trong `src/constants/`:
     * [x] `Spacing.ts`: Đầy đủ thang đo 4-point grid (`xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`).
     * [x] `Radius.ts`: Đầy đủ thang bo góc (`sm: 8`, `md: 12`, `lg: 16`, `full: 9999`).
     * [x] `Typography.ts`: Đầy đủ Type Ramp chuẩn Apple HIG (`largeTitle`, `title`, `headline`, `body`, `caption`).
     * [x] `src/constants/index.ts`: Export tập trung, sạch sẽ.
  2. Kiểm tra Component dùng chung:
     * [x] `ThemedText`: Tự động nhận diện variant và áp dụng đúng kích cỡ/độ đậm font.
     * [x] `PressableScale`: Hoạt động mượt mà 60fps khi nhấn nút quay lại hoặc tương tác trên `AllSavedTripsScreen` và `SavedTripScreen`, loại bỏ hoàn toàn code trùng lặp.
     * [x] `CustomButton`: Tuân thủ chuẩn màu SnapStep Mint (`#70C2B4`), hỗ trợ đầy đủ `variant`, `size`, `loading` và `pressed` states.


### Kịch Bản 19: Phân Rã Kiến Trúc CreateTripModal & Tuân Thủ Anti-Monolith Gate
> **Mục tiêu:** Đảm bảo CreateTripModal được giải phẫu thành công từ 954 dòng xuống dưới 420 dòng, phân chia các khối độc lập (LocationSearchInput, TripScheduleSection, TripCoverPickerSection) mà vẫn giữ nguyên vẹn 100% chức năng tạo/sửa hành trình du lịch.

* **Các bước thực hiện:**
  1. Mở modal `CreateTripModal`:
     * [x] Cụm ảnh bìa `TripCoverPickerSection` hiển thị mượt mà: chọn từ máy hoặc mẫu phong cảnh, hiện badge "Sẽ tải lên khi lưu".
     * [x] Cụm địa điểm `LocationSearchInput` hoạt động chuẩn xác: tự động gợi ý địa chỉ khi gõ (debounce 400ms) và nút "Vị trí hiện tại" quét GPS.
     * [x] Cụm lịch trình `TripScheduleSection`: thêm, sửa, xóa trạm dừng mượt mà.
  2. Lưu chuyến đi mới & Cập nhật chuyến đi cũ:
     * [x] Dữ liệu chuyến đi và lịch trình lưu chuẩn xác vào Firestore (`TripService.createTrip` / `updateTrip`).
     * [x] Danh sách `useTripStore` tự động làm mới tức thì.
     * [x] Đạt chuẩn Anti-Monolith Gate: file gọn gàng, chia nhỏ trách nhiệm theo chuẩn Clean Architecture.

### Kịch Bản 20: Đảm Bảo Khung SafeAreaProvider & Loại Bỏ Triệt Để Offline Banner
> **Mục tiêu:** Đảm bảo App.tsx được bao bọc chuẩn xác bởi SafeAreaProvider để các màn hình dùng `useSafeAreaInsets()` hoạt động ổn định không bị văng, đồng thời loại bỏ hoàn toàn tính năng thông báo ngoại tuyến (OfflineBanner) theo đúng yêu cầu người dùng mà không để lại code rác hay lỗi phụ thuộc.

* **Các bước thực hiện:**
  1. Khởi chạy ứng dụng:
     * [x] App khởi động và bundle mượt mà, không gặp lỗi `No safe area value available`.
     * [x] Mọi màn hình dùng `useSafeAreaInsets` (`SavedTripScreen`, `AllSavedTripsScreen`) lấy đúng insets padding của thiết bị.
  2. Kiểm tra việc loại bỏ OfflineBanner:
     * [x] Không còn banner cảnh báo mạng hiển thị trên đầu ứng dụng.
     * [x] Các file liên quan `OfflineBanner.tsx` và `useNetworkStatus.ts` đã được dọn sạch hoàn toàn khỏi cây thư mục.
     * [x] `npx tsc --noEmit` đạt Exit code 0, không có import mồ côi.

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
| 12 | Hiệu năng FlashList: Cuộn mượt mà 60fps, ước lượng size 75 | ⬜ Pass | `@shopify/flash-list` |
| 13 | Phân trang tải tin cũ: Hiện spinner xanh ngọc, không giật vị trí | ⬜ Pass | `loadMoreMessages` |
| 14 | Bảo mật RTDB Rules: Chặn triệt để UID lạ & chống mạo danh senderId | ⬜ Pass | `database.rules.json` |
| 15 | SavedTripScreen dữ liệu thật: Tải Firestore, timeline & ảnh check-in | ⬜ Pass | `TripService.getTripById` |
| 16 | Hiệu ứng expo-animation: Parallax Zoom ảnh bìa & Collapsing Header | ⬜ Pass | 100% UI thread Reanimated 4 |
| 17 | AllSavedTripsScreen FlashList: Tải thật từ useTripStore & phân trang | ⬜ Pass | Thay thế FlatList |
| 18 | Tạo & Sửa Chuyến đi: Lưu Firestore thật qua CreateTripModal | ⬜ Pass | Đồng bộ tức thì useTripStore |
| 19 | Chọn ảnh bìa từ thư viện máy: Lazy Upload & nén Nitro Image C++ | ⬜ Pass | `expo-media-library` & `ImageUtils` |
| 20 | Tự động lấy vị trí hiện tại GPS & dịch địa chỉ cụ thể | ⬜ Pass | `useLocation` hook tái sử dụng |
| 21 | Gợi ý địa điểm thời gian thực & Debounce 400ms chống rate limit | ⬜ Pass | `LocationSearchService` độc lập |
| 22 | Bộ Design Tokens chuẩn hóa & Component Contract (PressableScale, ThemedText, CustomButton) | ⬜ Pass | `expo-design-system` chuẩn |
| 23 | Phân rã kiến trúc CreateTripModal (giảm hơn 530 dòng code) | ⬜ Pass | Anti-Monolith Gate đạt chuẩn |
| 24 | Đảm bảo SafeAreaProvider toàn cục & gỡ sạch Offline Banner | ⬜ Pass | Không còn lỗi runtime safe area |


