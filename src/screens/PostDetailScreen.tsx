import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import { FlashList, useLayoutState } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { PostDetailScreenProps } from '../navigation/types';
import { useAlert } from '../components/AlertProvider';
import { ExplorePost } from '../components/ExplorePostCard';
import { useAuth } from '../navigation/AuthContext';
import { MyPhotoCard } from '../components/MyPhotoCard';
import { FriendPhotoCard } from '../components/FriendPhotoCard';
import { PostDetailHeader } from '../components/PostDetailHeader';
export const PostDetailScreen = ({
  navigation,
  route,
}: PostDetailScreenProps): React.JSX.Element => {
  const { post, posts: postsParam } = route.params;
  const { showAlert } = useAlert();
  const { user } = useAuth();
  
  const [flatListHeight, setFlatListHeight] = useState<number>(0);

  // Sử dụng mảng fallback nếu không có danh sách bài viết
  const posts = useMemo(() => postsParam || [post], [postsParam, post]);
  const initialIndex = useMemo(() => posts.findIndex((p) => p.id === post.id), [posts, post]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex !== -1 ? initialIndex : 0);
  const activePost = posts[currentIndex] || post;

  
  const flatListRef = useRef(null);

  const handleSettings = useCallback((): void => {
    showAlert({
      title: 'Tùy chọn bài viết',
      message: 'Báo cáo hoặc ẩn bài viết này.',
      type: 'info',
    });
  }, [showAlert]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    // Làm tròn xuống để tránh sai số thập phân (gây lệch ảnh khi lướt)
    const roundedHeight = Math.floor(height);
    if (roundedHeight > 0 && flatListHeight === 0) {
      setFlatListHeight(roundedHeight);
    }
  }, [flatListHeight]);



  // Cấu hình điều kiện để coi là 1 item đang được focus (chiếm 50% màn hình)
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Lắng nghe item nào đang chiếm > 50% màn hình (tránh stale closure bằng state setter)
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
    if (viewableItems.length > 0 && viewableItems[0].isViewable) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== null && newIndex !== undefined) {
        setCurrentIndex((prev) => (prev !== newIndex ? newIndex : prev));
      }
    }
  }).current;

  const renderItem = useCallback(({ item }: { item: ExplorePost }) => {
    return user.id === item.userId ? (
      <MyPhotoCard post={item} containerHeight={flatListHeight} />
    ) : (
      <FriendPhotoCard post={item} containerHeight={flatListHeight} />
    );
  }, [user.id, flatListHeight]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.innerContainer}>
        <PostDetailHeader
            activePost={activePost}
            onBack={() => navigation.goBack()}
            onSettings={handleSettings}
          />

          <View style={styles.listWrapper}  onLayout={handleLayout}>
            {flatListHeight > 0 && (
              <FlashList
                ref={flatListRef}
                data={posts}
                keyExtractor={(item) => item.id}
                pagingEnabled={true}
                snapToInterval={flatListHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                disableIntervalMomentum={true}
                
                showsVerticalScrollIndicator={false}
                initialScrollIndex={initialIndex !== -1 ? initialIndex : 0}
                
                // --- XỬ LÝ BÀN PHÍM CHUẨN CHO DANH SÁCH ---
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                
                // --- BẮT SỰ KIỆN FOCUS ---
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                
                renderItem={renderItem}
              />
            )}
             </View>
          
           
        </View>
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
