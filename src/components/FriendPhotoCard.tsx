import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ExplorePost } from './ExplorePostCard';
import { FloatingEmoji, FloatingItem } from './FloatingEmoji';
import { useAlert } from './AlertProvider';
import { CommentInputBar } from './CommentInputBar';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const EMOJI_REACTIONS = [
  { id: 'heart', emoji: '❤️' },
  { id: 'fire', emoji: '🔥' },
  { id: 'clap', emoji: '👏' },
  { id: 'like', emoji: '👍' },
  { id: 'laugh', emoji: '😂' },
  { id: 'angry', emoji: '😡' },
];

interface FriendPhotoCardProps {
  post: ExplorePost;
  containerHeight: number;
}

export const FriendPhotoCard = ({ post, containerHeight }: FriendPhotoCardProps): React.JSX.Element => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingItem[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  
  const keyboardHeight = useKeyboardHeight();

  const keyboardAdaptiveStyle = useAnimatedStyle(() => {
    return {
      bottom: keyboardHeight.value,
    };
  });

  const { showAlert } = useAlert();

  const handleSendComment = useCallback((): void => {
    if (!commentText.trim()) return;

    showAlert({
      title: 'Đã gửi phản hồi',
      message: `Bình luận của bạn trên bài viết @${post.userName || 'user'}: "${commentText}"`,
      type: 'success',
    });
    setCommentText('');
  }, [commentText, post, showAlert]);

  const removeFloatingEmoji = useCallback((id: string) => {
    setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleReactEmoji = (emojiId: string, emojiSymbol: string): void => {
    setSelectedEmoji(emojiId);

    const newItemId = `${Date.now()}_${Math.random()}`;
    const leftOffset = (Math.random() - 0.5) * 120;

    setFloatingEmojis((prev) => [
      ...prev,
      { id: newItemId, emoji: emojiSymbol, leftOffset },
    ]);
  };

  return (
    <View style={[styles.postCardContainer, { height: containerHeight }]}>
      {/* Main 3:4 Rounded Image Card */}
      <View style={styles.cardWrapper}>
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Floating Emoji Animation Container */}
        <View style={styles.floatingContainer} pointerEvents="none">
          {floatingEmojis.map((item) => (
            <FloatingEmoji
              key={item.id}
              emoji={item.emoji}
              leftOffset={item.leftOffset}
              onComplete={() => removeFloatingEmoji(item.id)}
            />
          ))}
        </View>

        {/* Time Badge (Top Right) */}
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>{post.timeAgo}</Text>
        </View>

        {/* Bottom Overlay Container */}
        <View style={styles.bottomOverlay}>
          {/* Location Badge */}
          <View style={styles.locationPill}>
            <Ionicons name="location" size={14} color={Colors.primary} />
            <Text style={styles.locationText}>{post.location}</Text>
          </View>

          {/* Caption Box */}
          <View style={styles.captionBox}>
            <Text style={styles.captionText}>
              {post.title || '#solotravel, misty mornings in the mountains... 🏔️ ✨'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Emoji Reactions Bar */}
      <View style={styles.reactionsContainer}>
        {EMOJI_REACTIONS.map((item) => {
          const isSelected = selectedEmoji === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => handleReactEmoji(item.id, item.emoji)}
              style={({ pressed }) => [
                styles.emojiBtn,
                isSelected && styles.emojiBtnSelected,
                pressed && { transform: [{ scale: 1.25 }] },
              ]}
            >
              <Text style={styles.emojiSymbol}>{item.emoji}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Spacer to prevent Floating CommentBar from covering reactions */}
    
     <Animated.View style={[styles.commentContainer,keyboardAdaptiveStyle]}>
       <CommentInputBar
        value={commentText}
        onChangeText={setCommentText}
        onSubmit={handleSendComment}
        visible={true}
      />
     </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  postCardContainer: {
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(112, 194, 180, 0.35)',
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
    zIndex: 10,
  },
  timeBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  timeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'flex-start',
    gap: 10,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 20, 23, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  locationText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  captionBox: {
    backgroundColor: 'rgba(15, 20, 23, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '96%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  captionText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 6,
    backgroundColor: 'rgba(30, 37, 43, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emojiBtnSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(112, 194, 180, 0.2)',
  },
  emojiSymbol: {
    fontSize: 19,
  },
  commentContainer:{
    flex:1,
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
    
  }
});
