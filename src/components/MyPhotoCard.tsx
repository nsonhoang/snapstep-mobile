import React from "react";
import { StyleSheet, View, Text, Image, Pressable } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { PostWithId } from "../services/postService";
import { formatPostTime } from "../utils/timeUtils";

interface MyPhotoCardProps {
  post: PostWithId;
  containerHeight: number;
}

export const MyPhotoCard = React.memo(
  ({ post, containerHeight }: MyPhotoCardProps): React.JSX.Element => {
    return (
      <View style={[styles.postCardContainer, { height: containerHeight }]}>
        {/* Main Photo Frame */}
        <View style={[styles.cardWrapper, styles.myPhotoCardWrapper]}>
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />

          {/* User Overlay */}
          <View style={styles.myPhotoUserOverlay}>
            <Text style={styles.myPhotoUserName}>@Me</Text>
          </View>

          {/* Time Badge */}
          <View style={styles.timeBadge}>
            <Text style={styles.timeText}>
              {formatPostTime(post.createdAt)}
            </Text>
          </View>

          {/* Bottom Overlay Container */}
          <View style={styles.bottomOverlay}>
            {/* Location Overlay */}
            <View style={styles.myPhotoLocationOverlay}>
              <Ionicons name="location" size={14} color={Colors.primary} />
              <Text style={styles.myPhotoLocationText}>
                {post.location?.address || "Chưa xác định"}
              </Text>
            </View>

            {/* Caption Bubble */}
            <View style={styles.myPhotoCaptionBox}>
              <Text style={styles.captionText}>
                {post.caption ||
                  "#roadtrip #hagiang misty mornings on the edge of the world... 🏔️✨"}
              </Text>
            </View>
          </View>
        </View>

        {/* Interaction Stats */}
        <View style={styles.myPhotoStatsContainer}>
          <View style={styles.myPhotoStatsLeft}>
            <View style={styles.statItem}>
              <Pressable style={styles.statBtn}>
                <Feather name="thumbs-up" size={20} color={Colors.textMuted} />
              </Pressable>
              <Text style={styles.statText}>{post.like ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Pressable style={styles.statBtn}>
                <Feather name="heart" size={20} color={Colors.textMuted} />
              </Pressable>
              <Text style={styles.statText}>{post.love ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Pressable style={styles.statBtn}>
                <Feather name="smile" size={20} color={Colors.textMuted} />
              </Pressable>
              <Text style={styles.statText}>{post.haha ?? 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Pressable style={styles.statBtn}>
                <Feather
                  name="thumbs-down"
                  size={20}
                  color={Colors.textMuted}
                />
              </Pressable>
              <Text style={styles.statText}>{post.hate ?? 0}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  postCardContainer: {
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardWrapper: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  timeBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  timeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  myPhotoCardWrapper: {
    aspectRatio: 4 / 5,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "rgba(112, 194, 180, 0.4)",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  myPhotoUserOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  myPhotoUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  myPhotoUserName: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: "flex-start",
    gap: 10,
  },
  myPhotoLocationOverlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15, 20, 23, 0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  myPhotoLocationText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  myPhotoCaptionBox: {
    backgroundColor: "rgba(15, 20, 23, 0.8)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: "96%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  captionText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  myPhotoStatsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",

    paddingHorizontal: 8,
  },
  myPhotoStatsLeft: {
    flexDirection: "row",
    alignItems: "center",

    gap: 20,
  },
  statItem: {
    alignItems: "center",
    gap: 6,
  },
  statBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  deleteBtn: {
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 180, 171, 0.2)",
  },
  deleteBtnText: {
    color: "#ffb4ab",
    fontSize: 13,
    fontWeight: "700",
  },
});
