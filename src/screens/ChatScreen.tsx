import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { ChatScreenProps } from "../navigation/types";
import {
  ChatReplyPost,
  ChatMessageUI,
  ChatService,
  getChatRoomId,
} from "../services/chatService";
import { ChatBubble } from "../components/ChatBubble";
import { useAuthStore } from "../stores/authStore";

export const ChatScreen = ({
  navigation,
  route,
}: ChatScreenProps): React.JSX.Element => {
  const {
    recipientId,
    recipientName,
    recipientAvatar,
    initialReplyPost,
    initialMessageText,
  } = route.params;

  const { user } = useAuthStore();
  const currentUserId = user?.uid || "";
  const chatId = getChatRoomId(currentUserId, recipientId);
  const failedStorageKey = `@failed_msg_${currentUserId}_${chatId}`;

  const [messages, setMessages] = useState<ChatMessageUI[]>([]);
  const [sendingMessages, setSendingMessages] = useState<ChatMessageUI[]>([]);
  const [failedMessages, setFailedMessages] = useState<ChatMessageUI[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [activeReplyPost, setActiveReplyPost] = useState<ChatReplyPost | undefined>(
    undefined
  );
  const [isSending, setIsSending] = useState<boolean>(false);

  const listRef = useRef<FlatList<ChatMessageUI>>(null);
  const hasSentInitialRef = useRef<boolean>(false);

  // 1. Tải danh sách tin nhắn gửi lỗi từ AsyncStorage khi vào phòng chat
  useEffect(() => {
    if (!currentUserId || !chatId) return;

    let isMounted = true;
    const loadFailedMessages = async (): Promise<void> => {
      try {
        const stored = await AsyncStorage.getItem(failedStorageKey);
        if (stored && isMounted) {
          const parsed = JSON.parse(stored) as ChatMessageUI[];
          setFailedMessages(parsed);
        } else if (isMounted) {
          setFailedMessages([]);
        }
      } catch (err) {
        console.error("Lỗi khi đọc tin nhắn lỗi từ AsyncStorage:", err);
      }
    };

    loadFailedMessages();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, chatId, failedStorageKey]);

  // Hàm lưu trữ danh sách tin nhắn lỗi vào AsyncStorage
  const saveFailedMessages = useCallback(
    async (list: ChatMessageUI[]): Promise<void> => {
      try {
        setFailedMessages(list);
        if (list.length === 0) {
          await AsyncStorage.removeItem(failedStorageKey);
        } else {
          await AsyncStorage.setItem(failedStorageKey, JSON.stringify(list));
        }
      } catch (err) {
        console.error("Lỗi khi lưu tin nhắn lỗi vào AsyncStorage:", err);
      }
    },
    [failedStorageKey]
  );

  // 2. Tự động gửi tin nhắn phản hồi ảnh Snap nếu được chuyển từ FriendPhotoCard sang
  useEffect(() => {
    if (
      initialMessageText &&
      initialReplyPost &&
      !hasSentInitialRef.current &&
      currentUserId &&
      recipientId
    ) {
      hasSentInitialRef.current = true;
      ChatService.sendMessage(
        currentUserId,
        recipientId,
        initialMessageText,
        initialReplyPost
      ).catch((err: Error) => {
        console.error("Lỗi khi gửi phản hồi ảnh Snap khởi tạo:", err);
      });
    }
  }, [initialMessageText, initialReplyPost, currentUserId, recipientId]);

  // 3. Lắng nghe danh sách tin nhắn Realtime qua WebSocket từ Realtime Database
  useEffect(() => {
    if (!currentUserId || !recipientId) return;

    // Đánh dấu đã xem tin nhắn khi vào phòng chat
    ChatService.markChatAsRead(currentUserId, chatId);

    // Lắng nghe realtime từ RTDB
    const unsubscribe = ChatService.subscribeMessages(
      chatId,
      currentUserId,
      recipientId,
      (incomingMessages) => {
        setMessages(incomingMessages);
      }
    );

    return () => unsubscribe();
  }, [chatId, currentUserId, recipientId]);

  // 4. Xử lý gửi tin nhắn mới với mã hóa AES và theo dõi trạng thái gửi
  const handleSendMessage = useCallback(async (): Promise<void> => {
    const trimmedText = inputText.trim();
    if (!trimmedText && !activeReplyPost) return;
    if (isSending || !currentUserId || !recipientId) return;

    setIsSending(true);
    const textToSend = trimmedText;
    const replyToSend = activeReplyPost;

    // Tạm thời làm sạch ô input để giao diện phản hồi tức thì
    setInputText("");
    setActiveReplyPost(undefined);

    // Tạo tin nhắn tạm ở trạng thái 'sending'
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const tempId = `sending_${Date.now()}`;
    const tempItem: ChatMessageUI = {
      id: tempId,
      senderId: currentUserId,
      text: textToSend,
      time: `${hours}:${minutes}`,
      isMe: true,
      replyPost: replyToSend,
      status: "sending",
    };

    setSendingMessages((prev) => [tempItem, ...prev]);

    try {
      await ChatService.sendMessage(
        currentUserId,
        recipientId,
        textToSend,
        replyToSend
      );
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn mã hóa:", error);
      // Khi gửi thất bại: chuyển sang trạng thái 'error' và lưu vào AsyncStorage
      const failedItem: ChatMessageUI = {
        ...tempItem,
        id: `failed_${Date.now()}`,
        status: "error",
      };
      setFailedMessages((prev) => {
        const updated = [failedItem, ...prev];
        AsyncStorage.setItem(failedStorageKey, JSON.stringify(updated)).catch(
          (e) => console.error("Lỗi lưu AsyncStorage:", e)
        );
        return updated;
      });
    } finally {
      // Bỏ tin nhắn tạm trong danh sách sending
      setSendingMessages((prev) => prev.filter((m) => m.id !== tempId));
      setIsSending(false);
    }
  }, [
    inputText,
    activeReplyPost,
    isSending,
    currentUserId,
    recipientId,
    failedStorageKey,
  ]);

  // 5. Xử lý khi nhấn vào tin nhắn lỗi để Thử lại hoặc Xóa
  const handlePressError = useCallback(
    (failedMsg: ChatMessageUI) => {
      Alert.alert(
        "Tin nhắn chưa gửi được",
        "Bạn có muốn thử gửi lại tin nhắn này không?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Xóa",
            style: "destructive",
            onPress: () => {
              const updated = failedMessages.filter((m) => m.id !== failedMsg.id);
              saveFailedMessages(updated);
            },
          },
          {
            text: "Thử lại",
            onPress: async () => {
              // Xóa khỏi danh sách lỗi trước
              const remaining = failedMessages.filter((m) => m.id !== failedMsg.id);
              await saveFailedMessages(remaining);

              // Tạo tin nhắn tạm gửi lại
              const tempId = `sending_${Date.now()}`;
              const retryItem: ChatMessageUI = {
                ...failedMsg,
                id: tempId,
                status: "sending",
              };
              setSendingMessages((prev) => [retryItem, ...prev]);

              try {
                await ChatService.sendMessage(
                  currentUserId,
                  recipientId,
                  failedMsg.text,
                  failedMsg.replyPost
                );
              } catch (err) {
                console.error("Lỗi khi thử gửi lại:", err);
                // Nếu vẫn lỗi, đưa lại vào danh sách lỗi
                const reFailedItem: ChatMessageUI = {
                  ...failedMsg,
                  status: "error",
                };
                setFailedMessages((prev) => {
                  const updated = [reFailedItem, ...prev];
                  AsyncStorage.setItem(failedStorageKey, JSON.stringify(updated)).catch(
                    (e) => console.error("Lỗi lưu AsyncStorage:", e)
                  );
                  return updated;
                });
              } finally {
                setSendingMessages((prev) => prev.filter((m) => m.id !== tempId));
              }
            },
          },
        ]
      );
    },
    [failedMessages, saveFailedMessages, currentUserId, recipientId, failedStorageKey]
  );

  // 6. Hợp nhất tin nhắn đang gửi, tin nhắn lỗi và tin nhắn đã tải từ RTDB
  // Vì FlatList inverted={true}, các phần tử ở đầu mảng sẽ hiển thị ở dưới đáy giao diện (mới nhất)
  const displayMessages = useMemo(() => {
    return [...sendingMessages, ...failedMessages, ...messages];
  }, [sendingMessages, failedMessages, messages]);

  const handleGoBack = (): void => {
    navigation.goBack();
  };

  const renderMessageItem = useCallback(
    ({ item }: { item: ChatMessageUI }) => {
      return (
        <ChatBubble
          message={item}
          onPressError={handlePressError}
        />
      );
    },
    [handlePressError]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* 1. Header cuộc trò chuyện */}
      <View style={styles.header}>
        <Pressable
          onPress={handleGoBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Feather name="arrow-left" size={24} color={Colors.white} />
        </Pressable>

        {/* Thông tin bạn bè */}
        <View style={styles.headerUserInfo}>
          <View style={styles.avatarWrapper}>
            {recipientAvatar ? (
              <Image
                source={recipientAvatar}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {recipientName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.userNameText} numberOfLines={1}>
              {recipientName}
            </Text>
            <Text style={styles.userStatusText}>Đang hoạt động</Text>
          </View>
        </View>

        {/* Nút tùy chọn phụ */}
        <Pressable style={styles.moreBtn} hitSlop={8}>
          <Feather name="more-vertical" size={20} color={Colors.textMuted} />
        </Pressable>
      </View>

      {/* 2. Danh sách tin nhắn Realtime (Mock) */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={styles.messageListWrapper}>
          <FlatList
            ref={listRef}
            data={displayMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            inverted={true} // Cuộn từ dưới lên chuẩn giao diện chat
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>

        {/* 3. Banner xem trước ảnh trích dẫn đang được đính kèm (nếu có) */}
        {activeReplyPost && (
          <View style={styles.replyPreviewBar}>
            <View style={styles.replyPreviewLeft}>
              <Ionicons name="sparkles" size={14} color={Colors.primary} />
              <Text style={styles.replyPreviewTitle}>Đang phản hồi khoảnh khắc</Text>
            </View>
            <Pressable
              onPress={() => setActiveReplyPost(undefined)}
              style={styles.cancelReplyBtn}
              hitSlop={6}
            >
              <Feather name="x" size={16} color={Colors.textMuted} />
            </Pressable>
          </View>
        )}

        {/* 4. Thanh gõ tin nhắn (Input Bar) */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Nhắn tin cho ${recipientName}...`}
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            maxLength={1000}
          />

          <Pressable
            onPress={handleSendMessage}
            style={({ pressed }) => [
              styles.sendBtn,
              (inputText.trim() || activeReplyPost) && styles.sendBtnActive,
              pressed && { opacity: 0.7 },
            ]}
            disabled={!inputText.trim() && !activeReplyPost}
          >
            <Ionicons
              name="send"
              size={18}
              color={
                inputText.trim() || activeReplyPost
                  ? Colors.black
                  : Colors.textMuted
              }
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerUserInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarInitial: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ADE80", // Xanh lá cây online
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  nameContainer: {
    flex: 1,
    justifyContent: "center",
  },
  userNameText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  userStatusText: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  moreBtn: {
    padding: 4,
  },
  chatArea: {
    flex: 1,
  },
  messageListWrapper: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
  },
  // Thanh đính kèm phản hồi
  replyPreviewBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#162522",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(140, 222, 207, 0.2)",
  },
  replyPreviewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  replyPreviewTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  cancelReplyBtn: {
    padding: 4,
  },
  // Khung nhập tin nhắn
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: "#1C1B1B",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    color: Colors.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
});
