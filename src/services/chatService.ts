import {
  getDatabase,
  ref,
  push,
  set,
  query,
  orderByChild,
  limitToLast,
  onValue,
  serverTimestamp as rtdbServerTimestamp,
  DataSnapshot,
} from "@react-native-firebase/database";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  orderBy,
  query as firestoreQuery,
  onSnapshot,
  serverTimestamp as firestoreServerTimestamp,
  FieldValue,
  Timestamp,
  QuerySnapshot,
} from "@react-native-firebase/firestore";
import {
  deriveChatRoomKey,
  encryptMessage,
  decryptMessage,
} from "../utils/cryptoUtils";
/**
 * Hàm tiện ích sinh ID phòng chat duy nhất giữa 2 người dùng (sắp xếp theo alphabet)
 */
export const getChatRoomId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join("_");
};

/**
 * Thẻ trích dẫn ảnh bài viết Snap khi người dùng phản hồi trực tiếp (Snap Reply)
 */
export interface ChatReplyPost {
  postId: string;
  imageUrl: string;
  caption?: string;
  locationName?: string;
}

/**
 * 🗄️ Schema Firestore: Danh sách hộp thư hội thoại của người dùng
 * Đường dẫn: users/{currentUserId}/chats/{chatId}
 */
export interface UserChatSummaryFirestore {
  chatId: string; // ID phòng chat = [uidA, uidB].sort().join('_')
  recipientId: string; // UID của người bạn trò chuyện
  lastMessageId: string; // ID của tin nhắn gần nhất bên Realtime Database (Firebase Push Key)
  lastMessageCiphertext: string; // Bản mã của tin nhắn gần nhất
  lastMessageIv: string; // IV để giải mã tin nhắn gần nhất
  lastSenderId: string; // UID người gửi tin cuối
  unreadCount: number; // Số lượng tin nhắn chưa đọc của riêng user này
  updatedAt: Timestamp | FieldValue; // Thời gian gửi tin cuối
}

/**
 * Dữ liệu hội thoại sau khi đã giải mã tin nhắn xem trước
 */
export interface UserChatSummaryUI extends UserChatSummaryFirestore {
  lastMessageDecrypted: string;
}

/**
 * ⚡ Schema Realtime Database: Cấu trúc từng tin nhắn trong phòng chat
 * Đường dẫn: messages/{chatId}/{messageId}
 */
export interface ChatMessageRTDB {
  senderId: string; // UID người gửi
  receiverId: string; // UID người nhận
  ciphertext: string; // Nội dung tin nhắn đã mã hóa (chuỗi Base64)
  iv: string; // Initialization Vector (16 bytes Hex)
  replyPost?: ChatReplyPost | null; // Dữ liệu ảnh Snap trích dẫn nếu có
  //isRead: boolean; // Trạng thái đã xem
  createdAt: number; // Timestamp mili-giây từ Server
}

export interface ChatMessageRTDBWithId extends ChatMessageRTDB {
  id: string; // Key tạo bởi Firebase RTDB push()
}

/**
 * Trạng thái gửi tin nhắn hiển thị trên giao diện người dùng (chỉ lưu tại máy/RAM)
 */
export type MessageStatus = "sending" | "sent" | "error";

/**
 * 📱 Kiểu dữ liệu phục vụ render trực tiếp lên giao diện người dùng (UI Component)
 */
export interface ChatMessageUI {
  id: string;
  senderId: string;
  text: string; // Nội dung đã được giải mã hiển thị cho người dùng
  time: string; // Chuỗi hiển thị giờ phút (vd: "09:20", "Vừa xong")
  isMe: boolean; // true nếu người gửi là currentUser
  status?: MessageStatus; // Trạng thái gửi tin nhắn cục bộ: 'sending' | 'sent' | 'error'
  replyPost?: ChatReplyPost | null;
}

export const ChatService = {
  /**
   * Sinh trước mã ID duy nhất (Push Key) cho tin nhắn mới từ Realtime Database
   *
   * @param chatId ID phòng chat
   * @returns Push Key từ Firebase RTDB
   */
  generateMessageId(chatId: string): string {
    const rtdb = getDatabase();
    const messagesCollectionRef = ref(rtdb, `messages/${chatId}`);
    const newMsgRef = push(messagesCollectionRef);
    return (
      newMsgRef.key ||
      `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    );
  },

  /**
   * Gửi tin nhắn mới: Mã hóa văn bản, ghi vào Realtime Database và cập nhật Firestore
   *
   * @param senderId UID người gửi
   * @param receiverId UID người nhận
   * @param text Nội dung tin nhắn văn bản
   * @param replyPost Thẻ ảnh Snap trích dẫn nếu có
   * @param customMessageId ID tin nhắn đã được sinh trước (tùy chọn)
   * @returns messageId (Push Key) của tin nhắn vừa gửi
   */
  async sendMessage(
    senderId: string,
    receiverId: string,
    text: string,
    replyPost?: ChatReplyPost | null,
    customMessageId?: string,
  ): Promise<string> {
    const trimmedText = text.trim();
    if (!trimmedText && !replyPost) {
      throw new Error("Tin nhắn không được để trống");
    }

    const chatId = getChatRoomId(senderId, receiverId);
    const roomKey = deriveChatRoomKey(senderId, receiverId);

    // 1. Mã hóa nội dung tin nhắn bằng AES
    const { ciphertext, iv } = encryptMessage(trimmedText, roomKey);

    // 2. Sử dụng ID tùy chọn hoặc sinh Firebase Push Key mới trên Client
    const rtdb = getDatabase();
    const messageId =
      customMessageId || push(ref(rtdb, `messages/${chatId}`)).key;

    if (!messageId) {
      throw new Error(
        "Không thể khởi tạo ID tin nhắn từ Firebase Realtime Database",
      );
    }

    const targetMsgRef = ref(rtdb, `messages/${chatId}/${messageId}`);

    // 3. Ghi dữ liệu tin nhắn vào Realtime Database
    const messageData: ChatMessageRTDB = {
      senderId,
      receiverId,
      ciphertext,
      iv,
      replyPost: replyPost || null,
      // isRead: false,
      createdAt: rtdbServerTimestamp() as unknown as number,
    };

    await set(targetMsgRef, messageData);

    // 4. Cập nhật song song tóm tắt hội thoại lên Firestore cho cả người gửi và người nhận
    const firestoreDb = getFirestore();
    const now = firestoreServerTimestamp();

    // Hộp thư của người gửi (Alice)
    const senderChatDocRef = doc(
      firestoreDb,
      `users/${senderId}/chats/${chatId}`,
    );

    // Hộp thư của người nhận (Bob)
    const receiverChatDocRef = doc(
      firestoreDb,
      `users/${receiverId}/chats/${chatId}`,
    );

    await Promise.all([
      setDoc(
        senderChatDocRef,
        {
          chatId,
          recipientId: receiverId,
          lastMessageId: messageId,
          lastMessageCiphertext: ciphertext,
          lastMessageIv: iv,
          lastSenderId: senderId,
          unreadCount: 0,
          updatedAt: now,
        },
        { merge: true },
      ),
      setDoc(
        receiverChatDocRef,
        {
          chatId,
          recipientId: senderId,
          lastMessageId: messageId,
          lastMessageCiphertext: ciphertext,
          lastMessageIv: iv,
          lastSenderId: senderId,
          unreadCount: FieldValue.increment(1),
          updatedAt: now,
        },
        { merge: true },
      ),
    ]);

    return messageId;
  },

  /**
   * Lắng nghe thời gian thực (Realtime WebSocket) danh sách tin nhắn của phòng chat từ Realtime Database
   *
   * @param chatId ID phòng chat
   * @param currentUserId UID người dùng hiện tại
   * @param otherUserId UID người bạn chat cùng
   * @param onMessagesUpdate Callback nhận danh sách tin nhắn đã giải mã (sắp xếp mới nhất ở đầu)
   * @returns Hàm hủy lắng nghe (unsubscribe)
   */
  subscribeMessages(
    chatId: string,
    currentUserId: string,
    otherUserId: string,
    onMessagesUpdate: (messages: ChatMessageUI[]) => void,
  ): () => void {
    const roomKey = deriveChatRoomKey(currentUserId, otherUserId);
    const rtdb = getDatabase();
    const messagesRef = ref(rtdb, `messages/${chatId}`);
    const messagesQuery = query(
      messagesRef,
      orderByChild("createdAt"),
      limitToLast(50),
    );

    const unsubscribe = onValue(messagesQuery, (snapshot: DataSnapshot) => {
      const messagesList: ChatMessageUI[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((childSnap: DataSnapshot) => {
          const val = childSnap.val() as ChatMessageRTDB;
          const plainText = decryptMessage(val.ciphertext, val.iv, roomKey);

          // Định dạng giờ hiển thị
          const msgDate = new Date(val.createdAt || Date.now());
          const hours = msgDate.getHours().toString().padStart(2, "0");
          const minutes = msgDate.getMinutes().toString().padStart(2, "0");

          messagesList.push({
            id: childSnap.key || `${Date.now()}_${Math.random()}`,
            senderId: val.senderId,
            text: plainText,
            time: `${hours}:${minutes}`,
            isMe: val.senderId === currentUserId,
            replyPost: val.replyPost || null,
          });

          return undefined; // Iterator callback requirement
        });
      }

      // Đảo ngược mảng vì FlatList hiển thị dùng inverted={true} (tin mới nhất ở đầu)
      onMessagesUpdate(messagesList.reverse());
    });

    return unsubscribe;
  },

  /**
   * Lắng nghe danh sách cuộc trò chuyện của người dùng từ Cloud Firestore
   *
   * @param currentUserId UID người dùng hiện tại
   * @param onChatsUpdate Callback nhận danh sách hội thoại kèm tin nhắn xem trước đã giải mã
   * @returns Hàm hủy lắng nghe (unsubscribe)
   */
  subscribeUserChats(
    currentUserId: string,
    onChatsUpdate: (chats: UserChatSummaryUI[]) => void,
  ): () => void {
    if (!currentUserId) return () => {};

    const firestoreDb = getFirestore();
    const userChatsCollectionRef = collection(
      firestoreDb,
      `users/${currentUserId}/chats`,
    );
    const userChatsQuery = firestoreQuery(
      userChatsCollectionRef,
      orderBy("updatedAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      userChatsQuery,
      (snapshot: QuerySnapshot) => {
        if (!snapshot) return;

        const chatsList: UserChatSummaryUI[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as UserChatSummaryFirestore;
          const roomKey = deriveChatRoomKey(currentUserId, data.recipientId);
          const decrypted = decryptMessage(
            data.lastMessageCiphertext,
            data.lastMessageIv,
            roomKey,
          );

          return {
            ...data,
            lastMessageDecrypted: decrypted,
          };
        });

        onChatsUpdate(chatsList);
      },
      (error: Error) => {
        console.error(
          "Lỗi khi lắng nghe danh sách chat trên Firestore:",
          error,
        );
      },
    );

    return unsubscribe;
  },

  /**
   * Đánh dấu cuộc trò chuyện là đã đọc (Reset unreadCount về 0 trên Firestore)
   *
   * @param currentUserId UID người dùng hiện tại
   * @param chatId ID phòng chat
   */
  async markChatAsRead(currentUserId: string, chatId: string): Promise<void> {
    if (!currentUserId || !chatId) return;

    try {
      const firestoreDb = getFirestore();
      const chatDocRef = doc(
        firestoreDb,
        `users/${currentUserId}/chats/${chatId}`,
      );
      await setDoc(
        chatDocRef,
        {
          unreadCount: 0,
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc cuộc trò chuyện:", error);
    }
  },
};
