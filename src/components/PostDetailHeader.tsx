import React from "react";
import { StyleSheet, View, Text, Image, Pressable } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { PostWithId } from "../services/postService";
import { useUserStore } from "../stores/userStore";

interface PostDetailHeaderProps {
  activePost: PostWithId;
  onBack: () => void;
  onSettings: () => void;
}

export const PostDetailHeader = ({
  activePost,
  onBack,
  onSettings,
}: PostDetailHeaderProps): React.JSX.Element => {
  const { users } = useUserStore();
  const author = users[activePost.authorId];
  const displayName = author?.firstName || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.headerContainer}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
        hitSlop={12}
      >
        <Ionicons name="chevron-back" size={26} color={Colors.white} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.userPill, pressed && styles.btnPressed]}
      >
        {author?.avatarUrl ? (
          <Image
            source={{ uri: author.avatarUrl }}
            style={styles.pillAvatar}
          />
        ) : (
          <View style={styles.pillAvatarPlaceholder}>
            <Text style={styles.pillAvatarInitial}>
              {initial}
            </Text>
          </View>
        )}
        <Text style={styles.pillText}>
          @
          {displayName.replace(/\s+/g, "_")}
        </Text>
        <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
      </Pressable>

      <Pressable
        onPress={onSettings}
        style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
        hitSlop={12}
      >
        <Feather name="settings" size={20} color={Colors.white} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  btnPressed: {
    opacity: 0.7,
  },
  userPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  pillAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  pillAvatarPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  pillAvatarInitial: {
    color: Colors.black,
    fontSize: 11,
    fontWeight: "700",
  },
  pillText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
