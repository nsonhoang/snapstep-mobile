import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { ChatReplyPost, ChatMessageUI } from "../services/chatService";

interface ChatBubbleProps {
  message: ChatMessageUI;
  onPressReplyPost?: (replyPost: ChatReplyPost) => void;
  onPressError?: (message: ChatMessageUI) => void;
}

export const ChatBubble = React.memo(
  ({
    message,
    onPressReplyPost,
    onPressError,
  }: ChatBubbleProps): React.JSX.Element => {
    const { isMe, text, time, replyPost, status } = message;

    return (
      <View
        style={[
          styles.bubbleWrapper,
          isMe ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
        ]}
      >
        <View
          style={[
            styles.bubbleContainer,
            isMe ? styles.bubbleContainerMe : styles.bubbleContainerThem,
          ]}
        >
          {/* Thẻ trích dẫn ảnh bài viết (Snap Reply Preview) */}
          {replyPost && (
            <Pressable
              onPress={() => onPressReplyPost?.(replyPost)}
              style={({ pressed }) => [
                styles.replyPostCard,
                isMe ? styles.replyPostCardMe : styles.replyPostCardThem,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Image
                source={replyPost.imageUrl}
                style={styles.replyThumbnail}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.replyInfo}>
                <View style={styles.replyBadgeRow}>
                  <Ionicons name="sparkles" size={12} color={Colors.primary} />
                  <Text style={styles.replyBadgeText}>Khoảnh khắc Snap</Text>
                </View>

                {replyPost.locationName && (
                  <View style={styles.replyLocationRow}>
                    <Ionicons
                      name="location-sharp"
                      size={11}
                      color={Colors.primary}
                    />
                    <Text style={styles.replyLocationText} numberOfLines={1}>
                      {replyPost.locationName}
                    </Text>
                  </View>
                )}

                {replyPost.caption && (
                  <Text style={styles.replyCaptionText} numberOfLines={1}>
                    {replyPost.caption}
                  </Text>
                )}
              </View>
            </Pressable>
          )}

          {/* Nội dung tin nhắn chữ */}
          {Boolean(text) && (
            <Text
              style={[
                styles.messageText,
                isMe ? styles.messageTextMe : styles.messageTextThem,
              ]}
            >
              {text}
            </Text>
          )}

          {/* Thời gian gửi tin nhắn và biểu tượng trạng thái */}
          <View style={styles.metaRow}>
            <Text
              style={[
                styles.timeText,
                isMe ? styles.timeTextMe : styles.timeTextThem,
              ]}
            >
              {time}
            </Text>

            {isMe && status === "sending" && (
              <Ionicons
                name="time-outline"
                size={11}
                color={Colors.textMuted}
                style={styles.statusIcon}
              />
            )}

            {isMe && status === "error" && (
              <Pressable
                onPress={() => onPressError?.(message)}
                hitSlop={6}
                style={({ pressed }) => [
                  styles.errorBtn,
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={13}
                  color={Colors.error}
                  style={styles.statusIcon}
                />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  bubbleWrapper: {
    marginVertical: 4,
    paddingHorizontal: 16,
    flexDirection: "row",
  },
  bubbleWrapperRight: {
    justifyContent: "flex-end",
  },
  bubbleWrapperLeft: {
    justifyContent: "flex-start",
  },
  bubbleContainer: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "relative",
  },
  bubbleContainerMe: {
    backgroundColor: "#16342F", // Tông Mint ngọc tối sâu sang trọng
    borderWidth: 1,
    borderColor: "rgba(140, 222, 207, 0.3)",
    borderBottomRightRadius: 4,
  },
  bubbleContainerThem: {
    backgroundColor: "#202020", // Tông xám than tối
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderBottomLeftRadius: 4,
  },
  // Khung trích dẫn bài viết
  replyPostCard: {
    flexDirection: "row",
    aspectRatio: 3 / 4,
    alignItems: "center",
    borderRadius: 12,
    padding: 6,
    marginBottom: 8,
    gap: 8,
  },
  replyPostCardMe: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  replyPostCardThem: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  replyThumbnail: {
    height: 150,
    aspectRatio: 3 / 4,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  replyInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  replyBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  replyBadgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  replyLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  replyLocationText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: "600",
  },
  replyCaptionText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextMe: {
    color: Colors.white,
  },
  messageTextThem: {
    color: Colors.white,
  },
  timeText: {
    fontSize: 10,
  },
  timeTextMe: {
    color: "rgba(140, 222, 207, 0.7)",
  },
  timeTextThem: {
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 4,
    gap: 3,
  },
  statusIcon: {
    marginLeft: 2,
  },
  errorBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
});
