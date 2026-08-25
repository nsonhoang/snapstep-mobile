import React, { useState, useEffect, useMemo, useCallback } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Feather, MaterialIcons } from "@expo/vector-icons";
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
import { ActivityIndicator } from "react-native";

import { ExploreSkeleton } from "../components/ExploreSkeleton";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "@react-native-firebase/firestore";
import { useAuthStore } from "../stores/authStore";
import { User } from "../services/userService";
import { Trip } from "../services/tripService";

const MOCK_FILTER_CHIPS: FilterChipItem[] = [
  { id: "all", label: "Tất cả" },
  {
    id: "1",
    label: "Me",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250",
  },
  { id: "2", label: "Besties" },
  {
    id: "3",
    label: "Minh",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250",
  },
  {
    id: "4",
    label: "An",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250",
  },
  { id: "5", label: "Lan" },
];

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
  // create user
  useEffect(() => {
    const createUser = async () => {
      if (!user?.uid) return;
      const userQuery = await getDoc(doc(db, "users", user?.uid));

      if (!userQuery.exists()) {
        const newUser: User = {
          // tạo database user
          firstName: user?.displayName || "",
          lastName: "",
          email: user?.email || "",
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
        // Kiểm tra xem có promise nào bị lỗi (rejected) không
        results.forEach((result) => {
          if (result.status === "rejected") {
            console.error("Lỗi khi tạo dữ liệu mặc định:", result.reason);
          }
        });
      }
    };
    createUser();
  }, [user?.uid]);

  // Initial load effect với Realtime Listener
  useEffect(() => {
    const unsubscribe = subscribePosts();
    // Dọn dẹp listener khi màn hình bị unmount để tránh rò rỉ bộ nhớ (memory leak)
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribePosts]);

  // Filter posts by search query
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
      // Tạm thời comment vì PostDetailScreen chưa đổi type sang PostWithId
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

  // Toggle View Mode with quick Skeleton feedback
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
        chips={MOCK_FILTER_CHIPS}
        selectedChipId={selectedChipId}
        onSelectChip={setSelectedChipId}
      />
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
            onEndReached={() => fetchMorePosts()}
            onEndReachedThreshold={0.5}
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

      {/* Dynamic View Toggle FAB */}
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
});
