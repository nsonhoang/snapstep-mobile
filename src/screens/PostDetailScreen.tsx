import React, { useState, useRef, useMemo, useCallback } from "react";
import { StyleSheet, View, LayoutChangeEvent, ViewToken } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { PostDetailScreenProps } from "../navigation/types";
import { useAlert } from "../components/AlertProvider";
import { useAuthStore } from "../stores/authStore";
import { usePostStore } from "../stores/postStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { MyPhotoCard } from "../components/MyPhotoCard";
import { FriendPhotoCard } from "../components/FriendPhotoCard";
import { PostDetailHeader } from "../components/PostDetailHeader";
import { BottomSheetMenu } from "../components/BottomSheetMenu";
import { PostService, PostWithId } from "../services/postService";
export const PostDetailScreen = ({
  navigation,
  route,
}: PostDetailScreenProps): React.JSX.Element => {
  const { post, posts: postsParam } = route.params;
  const { showAlert } = useAlert();
  const { user } = useAuthStore();
  const removePostFromStore = usePostStore((state) => state.removePost);

  const [flatListHeight, setFlatListHeight] = useState<number>(0);

  // Dùng ref để gọi phương thức mở/đóng Bottom Sheet thay vì state boolean
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Sử dụng local state để cập nhật UI ngay khi xóa bài
  const [localPosts, setLocalPosts] = useState<PostWithId[]>(
    postsParam || [post],
  );

  const initialIndex = useMemo(
    () => localPosts.findIndex((p) => p.id === post.id),
    [localPosts, post],
  );

  const [currentIndex, setCurrentIndex] = useState<number>(
    initialIndex !== -1 ? initialIndex : 0,
  );
  const activePost = localPosts[currentIndex] || post;

  const flatListRef = useRef(null);

  const handleDelete = async (id: string) => {
    try {
      await PostService.deletePost(id);
      console.log("Xóa bài viết: ", id);
      removePostFromStore(id);
      const updatedPosts = localPosts.filter((p) => p.id !== id);
      setLocalPosts(updatedPosts);
      showAlert({
        message: "Gỡ bài viết thành công",
        title: "Thành công",
      });
      if (updatedPosts.length === 0) {
        navigation.goBack();
      }
    } catch (error) {
      showAlert({
        title: "Đã có lỗi xảy ra",
        message: "Vui lòng thử lại",
        type: "error",
        confirmText: "OK",
      });
    }
  };

  const showDeleteConfirm = (id: string) => {
    showAlert({
      title: "Xác nhận xóa",
      message:
        "Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.",
      type: "warning",
      confirmText: "Xóa",
      cancelText: "Hủy",
      onConfirm: () => handleDelete(id),
    });
  };

  const handleSettings = () => {
    bottomSheetModalRef.current?.present();
  };

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { height } = e.nativeEvent.layout;
      // Làm tròn xuống để tránh sai số thập phân (gây lệch ảnh khi lướt)
      const roundedHeight = Math.floor(height);
      if (roundedHeight > 0 && flatListHeight === 0) {
        setFlatListHeight(roundedHeight);
      }
    },
    [flatListHeight],
  );

  // Cấu hình điều kiện để coi là 1 item đang được focus (chiếm 50% màn hình)
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Lắng nghe item nào đang chiếm > 50% màn hình (tránh stale closure bằng state setter)
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken> }) => {
      if (viewableItems.length > 0 && viewableItems[0].isViewable) {
        const newIndex = viewableItems[0].index;
        if (newIndex !== null && newIndex !== undefined) {
          setCurrentIndex((prev) => (prev !== newIndex ? newIndex : prev));
        }
      }
    },
  ).current;

  const renderItem = useCallback(
    ({ item }: { item: PostWithId }) => {
      return user?.uid === item.authorId ? (
        <MyPhotoCard post={item} containerHeight={flatListHeight} />
      ) : (
        <FriendPhotoCard post={item} containerHeight={flatListHeight} />
      );
    },
    [user?.uid, flatListHeight],
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={styles.innerContainer}>
        <PostDetailHeader
          activePost={activePost}
          onBack={() => navigation.goBack()}
          onSettings={handleSettings}
        />

        <View style={styles.listWrapper} onLayout={handleLayout}>
          {flatListHeight > 0 && localPosts.length > 0 && (
            <FlashList
              ref={flatListRef}
              data={localPosts}
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

        <BottomSheetMenu
          ref={bottomSheetModalRef}
          title="Tùy chọn bài viết"
          options={
            user?.uid === activePost.authorId
              ? [
                  {
                    id: "edit",
                    label: "Chỉnh sửa bài viết",
                    iconName: "edit-2",
                    onPress: () =>
                      showAlert({
                        title: "Thông báo",
                        message: "Tính năng chỉnh sửa đang phát triển",
                        type: "info",
                      }),
                  },
                  {
                    id: "download",
                    label: "Tải ảnh",
                    iconName: "download",
                    onPress: () =>
                      showAlert({
                        title: "Thông báo",
                        message: "Tính năng tải ảnh đang phát triển",
                        type: "info",
                      }),
                  },
                  {
                    id: "delete",
                    label: "Xóa bài viết",
                    iconName: "trash-2",
                    isDestructive: true,
                    onPress: () => showDeleteConfirm(activePost.id),
                  },
                ]
              : [
                  {
                    id: "download",
                    label: "Tải ảnh",
                    iconName: "download",
                    onPress: () =>
                      showAlert({
                        title: "Thông báo",
                        message: "Tính năng tải ảnh đang phát triển",
                        type: "info",
                      }),
                  },
                ]
          }
        />
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
    justifyContent: "space-between",
  },
  listWrapper: {
    flex: 1,
  },
  floatingKeyboardContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});
