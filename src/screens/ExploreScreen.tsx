import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { ExploreScreenProps } from "../navigation/types";
import { ExploreSearchBar } from "../components/ExploreSearchBar";
import {
  ExploreFilterChips,
  FilterChipItem,
} from "../components/ExploreFilterChips";
import { ExplorePostCard } from "../components/ExplorePostCard";
import { usePostStore } from "../stores/postStore";
import { PostWithId } from "../services/postService";
import { ExploreSkeleton } from "../components/ExploreSkeleton";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import { useAuthStore } from "../stores/authStore";
import { useFriendshipStore } from "../stores/friendshipStore";
import { User } from "../services/userService";
import { Trip } from "../services/tripService";

export const ExploreScreen = ({
  navigation,
}: ExploreScreenProps): React.JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedChipId, setSelectedChipId] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "feed">("grid");
  const db = getFirestore();
  const { user } = useAuthStore();
  const { posts, isLoading, isFetchingMore, subscribePosts, fetchMorePosts } =
    usePostStore();

  const { friends, subscribeFriends } = useFriendshipStore();

  // Khởi tạo user và chuyến đi mặc định nếu là lần đầu đăng nhập
  useEffect(() => {
    const createUser = async () => {
      if (!user?.uid) return;
      const userQuery = await getDoc(doc(db, "users", user?.uid));

      if (!userQuery.exists()) {
        // Trích xuất tên từ email (ví dụ: hoangson@gmail.com -> hoangson)
        const emailName = user?.email ? user.email.split('@')[0] : 'Explorer';
        const defaultName = user?.displayName || emailName;

        const newUser: User = {
          firstName: defaultName,
          lastName: defaultName,
          username: emailName,
          email: user?.email || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ghostMode: false,
          stats: {
            conqueredProvincesCount: 0,
            totalPhotosCount: 0,
          },
          conqueredProvinces: {},
        };

        const userTrip: Trip = {
          userId: user?.uid,
          title: "Khác",
          like: 0,
          love: 0,
          hate: 0,
          description: "",
          coverImageUrl: "",
          details: [],
          postIds: [],
          status: "another",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const results = await Promise.allSettled([
          setDoc(doc(db, "users", user?.uid), newUser),
          setDoc(doc(db, "trips", user?.uid), userTrip),
        ]);

        results.forEach((result) => {
          if (result.status === "rejected") {
            console.error("Lỗi khi tạo dữ liệu mặc định:", result.reason);
          }
        });
      }
    };
    createUser();
  }, [user?.uid]);

  // Lắng nghe danh sách bạn bè thời gian thực
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeFriends(user.uid);
    return () => {
      if (unsub) unsub();
    };
  }, [user?.uid, subscribeFriends]);

  // Danh sách tác giả được phép xem: chính mình + bạn bè đã accepted (đảm bảo ID duy nhất)
  const allowedAuthorIds = useMemo(() => {
    if (!user?.uid) return [];
    return Array.from(new Set([user.uid, ...friends.map((f) => f.id)]));
  }, [user?.uid, friends]);

  // Lắng nghe Realtime các bài viết của chính mình và bạn bè
  useEffect(() => {
    if (allowedAuthorIds.length === 0) return;
    const unsubscribe = subscribePosts(allowedAuthorIds);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [allowedAuthorIds, subscribePosts]);

  // Tạo các chip lọc động từ danh sách bạn bè thật (ngăn chặn hoàn toàn trùng lặp key)
  const filterChips: FilterChipItem[] = useMemo(() => {
    const myId = user?.uid || "me";
    const chips: FilterChipItem[] = [
      { id: "all", label: "Tất cả" },
      {
        id: myId,
        label: "Me",
        avatar: user?.photoURL || undefined,
      },
    ];

    friends.forEach((f) => {
      // Bỏ qua nếu là chính mình để tránh trùng key với chip "Me"
      if (f.id === myId || f.id === user?.uid) return;

      chips.push({
        id: f.id,
        label: f.firstName || f.email?.split("@")[0] || "Bạn",
        avatar: f.avatarUrl,
      });
    });

    return chips;
  }, [user?.uid, user?.photoURL, friends]);

  // Lọc bài viết theo ô tìm kiếm và chip bạn bè đã chọn
  const filteredPosts = useMemo(() => {
    if (selectedChipId === "all") {
      return posts.filter((post) =>
        post.location?.address
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
    } else {
      return posts.filter(
        (post) =>
          post.authorId === selectedChipId &&
          post.location?.address
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }
  }, [searchQuery, selectedChipId, posts]);

  const handlePressPost = useCallback(
    (post: PostWithId): void => {
      navigation.navigate("PostDetail", { post, posts: filteredPosts });
    },
    [navigation, filteredPosts],
  );

  const renderPostItem = useCallback(
    ({ item }: { item: PostWithId }) => (
      <View style={viewMode === "grid" ? styles.gridCell : styles.feedCell}>
        <ExplorePostCard
          post={item}
          isFeedMode={viewMode === "feed"}
          onPressPost={handlePressPost}
        />
      </View>
    ),
    [viewMode, handlePressPost],
  );

  const handleToggleViewMode = (): void => {
    const nextMode = viewMode === "grid" ? "feed" : "grid";
    setViewMode(nextMode);
  };

  const renderHeader = () => (
    <View>
      <ExploreSearchBar
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
      />
      <ExploreFilterChips
        chips={filterChips}
        selectedChipId={selectedChipId}
        onSelectChip={setSelectedChipId}
      />
    </View>
  );

  // Giao diện khi chưa có bài viết nào
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="compass" size={56} color={Colors.outline} />
      <Text style={styles.emptyTitle}>Chưa có khoảnh khắc nào</Text>
      <Text style={styles.emptySubtitle}>
        Kết nối với bạn bè để cùng chia sẻ những bức ảnh hành trình tuyệt đẹp!
      </Text>
      <Pressable
        style={({ pressed }) => [styles.findBuddiesBtn, pressed && styles.pressed]}
        onPress={() => navigation.navigate("SearchBuddies")}
      >
        <Feather name="user-plus" size={16} color={Colors.black} />
        <Text style={styles.findBuddiesBtnText}>Tìm Bạn Bè Ngay</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {renderHeader()}

      {isLoading && posts.length === 0 ? (
        <ExploreSkeleton viewMode={viewMode} />
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            key={viewMode === "grid" ? "grid-list" : "feed-list"}
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === "grid" ? 2 : 1}
            renderItem={renderPostItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            onEndReached={() => fetchMorePosts(allowedAuthorIds)}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={!isLoading ? renderEmptyState : null}
            ListFooterComponent={
              isFetchingMore ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.primary}
                  style={{ marginVertical: 16 }}
                />
              ) : null
            }
          />
        </View>
      )}

      {/* Nút chuyển đổi giao diện Grid / Feed */}
      <Pressable
        onPress={handleToggleViewMode}
        style={({ pressed }) => [
          styles.fab,
          pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
        ]}
      >
        <Feather
          name={viewMode === "grid" ? "list" : "grid"}
          size={22}
          color={Colors.black}
        />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flatListContent: {
    paddingHorizontal: 10,
    paddingBottom: 90,
  },
  gridCell: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  feedCell: {
    width: "100%",
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingTop: 80,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  findBuddiesBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 24,
  },
  findBuddiesBtnText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
