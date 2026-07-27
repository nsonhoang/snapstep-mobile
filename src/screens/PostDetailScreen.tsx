import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { PostDetailScreenProps } from '../navigation/types';
import { useAlert } from '../components/AlertProvider';
import { ExplorePost } from '../components/ExplorePostCard';

const EMOJI_REACTIONS = [
  { id: 'heart', emoji: '❤️' },
  { id: 'fire', emoji: '🔥' },
  { id: 'clap', emoji: '👏' },
  { id: 'like', emoji: '👍' },
  { id: 'laugh', emoji: '😂' },
  { id: 'angry', emoji: '😡' },
];

interface FloatingItem {
  id: string;
  emoji: string;
  leftOffset: number;
}

const FloatingEmoji = ({
  emoji,
  leftOffset,
  onComplete,
}: {
  emoji: string;
  leftOffset: number;
  onComplete: () => void;
}): React.JSX.Element => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: 1200, easing: Easing.out(Easing.cubic) },
      (finished?: boolean) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }
    );
  }, [onComplete, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = progress.value * -220;
    const scale =
      progress.value < 0.2
        ? 0.3 + (progress.value / 0.2) * 1.2
        : 1.5 - ((progress.value - 0.2) / 0.8) * 0.6;
    const opacity =
      progress.value < 0.15
        ? progress.value / 0.15
        : 1 - (progress.value - 0.15) / 0.85;

    return {
      transform: [{ translateX: leftOffset }, { translateY }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.floatingEmojiItem, animatedStyle]}>
      <Text style={styles.floatingEmojiText}>{emoji}</Text>
    </Animated.View>
  );
};

interface PostDetailCardProps {
  post: ExplorePost;
  containerHeight: number;
}

const PostDetailCard = ({ post, containerHeight }: PostDetailCardProps): React.JSX.Element => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingItem[]>([]);

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
      {/* 2. Main 3:4 Rounded Image Card (Stitch Compact Style) */}
      <View style={styles.cardWrapper}>
        <Image
          source={{ uri: post.imageUrl }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Floating Emoji Animation Container (Reanimated 60FPS) */}
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

      {/* 3. Quick Emoji Reactions Bar */}
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
    </View>
  );
};

export const PostDetailScreen = ({
  navigation,
  route,
}: PostDetailScreenProps): React.JSX.Element => {
  const { post, posts: postsParam } = route.params;
  const { showAlert } = useAlert();
  const [commentText, setCommentText] = useState<string>('');
  const [flatListHeight, setFlatListHeight] = useState<number>(0);

  // Fallback to array if posts list is not provided
  const posts = useMemo(() => postsParam || [post], [postsParam, post]);
  const initialIndex = useMemo(() => posts.findIndex((p) => p.id === post.id), [posts, post]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex !== -1 ? initialIndex : 0);
  const activePost = posts[currentIndex] || post;

  const flatListRef = useRef<FlatList<ExplorePost>>(null);

  const handleSendComment = (): void => {
    if (!commentText.trim()) return;

    showAlert({
      title: 'Đã gửi phản hồi',
      message: `Bình luận của bạn trên bài viết @${activePost.userName || 'user'}: "${commentText}"`,
      type: 'success',
    });
    setCommentText('');
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 45}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.innerContainer}>
            {/* 1. Header Bar */}
            <View style={styles.headerContainer}>
              {/* Back Button - Dismiss Modal */}
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
                hitSlop={12}
              >
                <Ionicons name="chevron-back" size={26} color={Colors.white} />
              </Pressable>

              {/* User Pill Selector */}
              <Pressable
                style={({ pressed }) => [styles.userPill, pressed && styles.btnPressed]}
              >
                {activePost.userAvatar ? (
                  <Image source={{ uri: activePost.userAvatar }} style={styles.pillAvatar} />
                ) : (
                  <View style={styles.pillAvatarPlaceholder}>
                    <Text style={styles.pillAvatarInitial}>
                      {(activePost.userName || 'User').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.pillText}>
                  @{activePost.userName ? activePost.userName.replace(/\s+/g, '_') : 'Alex_W'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
              </Pressable>

              {/* Settings Button */}
              <Pressable
                onPress={() =>
                  showAlert({
                    title: 'Tùy chọn bài viết',
                    message: 'Báo cáo hoặc ẩn bài viết này.',
                    type: 'info',
                  })
                }
                style={({ pressed }) => [styles.iconBtn, pressed && styles.btnPressed]}
                hitSlop={12}
              >
                <Feather name="settings" size={20} color={Colors.white} />
              </Pressable>
            </View>

            {/* Vertical FlatList for swiping between posts */}
            <View
              style={styles.listWrapper}
              onLayout={(e) => {
                const { height } = e.nativeEvent.layout;
                // Only lock height once on initial load to prevent layout jank when keyboard opens
                if (height > 0 && flatListHeight === 0) {
                  setFlatListHeight(height);
                }
              }}
            >
              {flatListHeight > 0 && (
                <FlatList
                  ref={flatListRef}
                  data={posts}
                  keyExtractor={(item) => item.id}
                  pagingEnabled
                  showsVerticalScrollIndicator={false}
                  initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
                  getItemLayout={(_data, index) => ({
                    length: flatListHeight,
                    offset: flatListHeight * index,
                    index,
                  })}
                  onScrollToIndexFailed={(info) => {
                    const wait = new Promise((resolve) => setTimeout(resolve, 50));
                    wait.then(() => {
                      flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
                    });
                  }}
                  onMomentumScrollEnd={(e) => {
                    const offset = e.nativeEvent.contentOffset.y;
                    const index = Math.round(offset / flatListHeight);
                    if (index >= 0 && index < posts.length) {
                      setCurrentIndex(index);
                    }
                  }}
                  renderItem={({ item }) => (
                    <PostDetailCard post={item} containerHeight={flatListHeight} />
                  )}
                />
              )}
            </View>

            {/* 4. Seamless Floating Input Bar */}
            <View style={styles.seamlessInputContainer}>
              <View style={styles.inputFloatingPill}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Share your feelings..."
                  placeholderTextColor={Colors.textMuted}
                  value={commentText}
                  onChangeText={setCommentText}
                  onSubmitEditing={handleSendComment}
                />
                <Pressable
                  onPress={handleSendComment}
                  style={({ pressed }) => [
                    styles.sendBtn,
                    pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <Ionicons name="send" size={16} color={Colors.black} />
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  btnPressed: {
    opacity: 0.7,
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillAvatarInitial: {
    color: Colors.black,
    fontSize: 11,
    fontWeight: '700',
  },
  pillText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  listWrapper: {
    flex: 1,
  },
  postCardContainer: {
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 28,
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
  floatingEmojiItem: {
    position: 'absolute',
    bottom: 40,
  },
  floatingEmojiText: {
    fontSize: 44,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
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
  seamlessInputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 14 : 10,
    backgroundColor: Colors.transparent,
  },
  inputFloatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  textInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    paddingVertical: 8,
    paddingRight: 10,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
