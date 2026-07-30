import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export interface ExplorePost {
  id: string;
  userId: string;
  imageUrl: string;
  location: string;
  timeAgo: string;
  userName?: string;
  userAvatar?: string;
  title?: string;
  aspectRatio?: number;
}

interface ExplorePostCardProps {
  post: ExplorePost;
  isFeedMode?: boolean;
  onPressPost?: (post: ExplorePost) => void;
}

export const ExplorePostCard = ({
  post,
  isFeedMode = false,
  onPressPost,
}: ExplorePostCardProps): React.JSX.Element => {
  return (
    <Pressable
      onPress={() => onPressPost?.(post)}
      style={({ pressed }) => [
        styles.cardContainer,
        isFeedMode ? styles.feedCardContainer : styles.gridCardContainer,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      {/* Background Image - Strict 3:4 Cover */}
      <Image
        source={post.imageUrl}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />

      {/* Top Left User Author Badge */}
      {post.userName && (
        <View style={[styles.userBadge, isFeedMode && styles.feedUserBadge]}>
          {post.userAvatar ? (
            <Image source={post.userAvatar} style={styles.userAvatar} contentFit="cover" transition={300} />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Text style={styles.userAvatarInitial}>
                {post.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.userNameText, isFeedMode && styles.feedUserNameText]} numberOfLines={1}>
            {post.userName}
          </Text>
        </View>
      )}

      {/* Top Right Time Badge */}
      <View style={[styles.timeBadge, isFeedMode && styles.feedTimeBadge]}>
        <Text style={[styles.timeText, isFeedMode && styles.feedTimeText]}>
          {post.timeAgo}
        </Text>
      </View>

      {/* Bottom Overlay Container (Stitch Compact Style) */}
      <View style={[styles.bottomContainer, isFeedMode && styles.feedBottomContainer]}>
        {/* Location Tag Badge */}
        <View style={[styles.locationBadge, isFeedMode && styles.feedLocationBadge]}>
          <Ionicons name="location" size={isFeedMode ? 14 : 12} color={Colors.primary} />
          <Text
            style={[styles.locationText, isFeedMode && styles.feedLocationText]}
            numberOfLines={1}
          >
            {post.location}
          </Text>
        </View>

        {/* Title / Caption Box (Feed Mode) */}
        {isFeedMode && post.title && (
          <View style={styles.feedTitleBox}>
            <Text style={styles.feedPostTitle} numberOfLines={2}>
              {post.title}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gridCardContainer: {
    borderRadius: 16,
    marginBottom: 12,
  },
  feedCardContainer: {
    borderRadius: 24,
    marginBottom: 18,
    borderColor: 'rgba(112, 194, 180, 0.3)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  userBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    maxWidth: '60%',
  },
  feedUserBadge: {
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  userAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  userAvatarPlaceholder: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarInitial: {
    color: Colors.black,
    fontSize: 10,
    fontWeight: '700',
  },
  userNameText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  feedUserNameText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  feedTimeBadge: {
    top: 14,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  feedTimeText: {
    fontSize: 12,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    alignItems: 'flex-start',
    gap: 6,
  },
  feedBottomContainer: {
    bottom: 16,
    left: 16,
    right: 16,
    gap: 8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    maxWidth: '85%',
  },
  feedLocationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 20, 23, 0.75)',
  },
  locationText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  feedLocationText: {
    fontSize: 13,
    fontWeight: '700',
  },
  feedTitleBox: {
    backgroundColor: 'rgba(15, 20, 23, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '92%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  feedPostTitle: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
