import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { PostDetailScreenProps } from '../navigation/types';
import { useAlert } from '../components/AlertProvider';
import { ExplorePost } from '../components/ExplorePostCard';
import { useAuth } from '../navigation/AuthContext';
import { MyPhotoCard } from '../components/MyPhotoCard';
import { FriendPhotoCard } from '../components/FriendPhotoCard';
import { PostDetailHeader } from '../components/PostDetailHeader';
import { CommentInputBar } from '../components/CommentInputBar';

export const PostDetailScreen = ({
  navigation,
  route,
}: PostDetailScreenProps): React.JSX.Element => {
  const { post, posts: postsParam } = route.params;
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState<string>('');
  const [flatListHeight, setFlatListHeight] = useState<number>(0);

  // Sử dụng mảng fallback nếu không có danh sách bài viết
  const posts = useMemo(() => postsParam || [post], [postsParam, post]);
  const initialIndex = useMemo(() => posts.findIndex((p) => p.id === post.id), [posts, post]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex !== -1 ? initialIndex : 0);
  const activePost = posts[currentIndex] || post;

  const flatListRef = useRef<FlatList<ExplorePost>>(null);

  // Tối ưu các callback với useCallback để tránh re-render không cần thiết
  const handleSendComment = useCallback((): void => {
    if (!commentText.trim()) return;

    showAlert({
      title: 'Đã gửi phản hồi',
      message: `Bình luận của bạn trên bài viết @${activePost.userName || 'user'}: "${commentText}"`,
      type: 'success',
    });
    setCommentText('');
    Keyboard.dismiss();
  }, [commentText, activePost, showAlert]);

  const handleSettings = useCallback((): void => {
    showAlert({
      title: 'Tùy chọn bài viết',
      message: 'Báo cáo hoặc ẩn bài viết này.',
      type: 'info',
    });
  }, [showAlert]);

  const handleLayout = useCallback((e: any) => {
    const { height } = e.nativeEvent.layout;
    if (height > 0 && flatListHeight === 0) {
      setFlatListHeight(height);
    }
  }, [flatListHeight]);

  const getItemLayout = useCallback((_data: any, index: number) => ({
    length: flatListHeight,
    offset: flatListHeight * index,
    index,
  }), [flatListHeight]);

  const onScrollToIndexFailed = useCallback((info: any) => {
    const wait = new Promise((resolve) => setTimeout(resolve, 50));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
    });
  }, []);

  const onMomentumScrollEnd = useCallback((e: any) => {
    const offset = e.nativeEvent.contentOffset.y;
    const index = Math.round(offset / flatListHeight);
    if (index >= 0 && index < posts.length) {
      setCurrentIndex(index);
    }
  }, [flatListHeight, posts.length]);

  const renderItem = useCallback(({ item }: { item: ExplorePost }) => {
    return user.id === item.userId ? (
      <MyPhotoCard post={item} containerHeight={flatListHeight} />
    ) : (
      <FriendPhotoCard post={item} containerHeight={flatListHeight} />
    );
  }, [user.id, flatListHeight]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          <PostDetailHeader
            activePost={activePost}
            onBack={() => navigation.goBack()}
            onSettings={handleSettings}
          />

          <View style={styles.listWrapper} onLayout={handleLayout}>
            {flatListHeight > 0 && (
              <FlatList
                ref={flatListRef}
                data={posts}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
                getItemLayout={getItemLayout}
                onScrollToIndexFailed={onScrollToIndexFailed}
                onMomentumScrollEnd={onMomentumScrollEnd}
                renderItem={renderItem}
                contentInsetAdjustmentBehavior="automatic"
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Floating Keyboard Avoiding Container */}
      <KeyboardAvoidingView
        style={styles.floatingKeyboardContainer}
        behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <CommentInputBar
          value={commentText}
          onChangeText={setCommentText}
          onSubmit={handleSendComment}
          visible={user.id !== activePost.userId}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listWrapper: {
    flex: 1,
  },
  floatingKeyboardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});
