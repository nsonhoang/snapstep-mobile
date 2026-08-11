import { create } from "zustand";
import { DocumentSnapshot } from "@react-native-firebase/firestore";
import { PostWithId, PostService } from "../services/postService";

interface PostState {
  posts: PostWithId[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  lastDoc: DocumentSnapshot | null;

  fetchPosts: (authorId?: string) => Promise<void>;
  fetchMorePosts: (authorId?: string) => Promise<void>;
}

const POSTS_PER_PAGE = 10;

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  isFetchingMore: false,
  hasMore: true,
  lastDoc: null,

  fetchPosts: async (authorId?: string) => {
    set({ isLoading: true, hasMore: true });
    try {
      const { posts, lastDoc } = await PostService.getPosts(
        POSTS_PER_PAGE,
        authorId,
      );

      set({
        posts,
        isLoading: false,
        lastDoc,
        hasMore: posts.length === POSTS_PER_PAGE,
      });
    } catch (error) {
      console.error("Lỗi khi tải Posts:", error);
      set({ isLoading: false });
    }
  },

  fetchMorePosts: async (authorId?: string) => {
    const { isFetchingMore, hasMore, lastDoc, posts } = get();

    if (isFetchingMore || !hasMore || !lastDoc) return;

    set({ isFetchingMore: true });
    try {
      const { posts: newPosts, lastDoc: newLastDoc } =
        await PostService.getMorePosts(POSTS_PER_PAGE, lastDoc, authorId);

      set({
        posts: [...posts, ...newPosts],
        isFetchingMore: false,
        lastDoc: newLastDoc,
        hasMore: newPosts.length === POSTS_PER_PAGE,
      });
    } catch (error) {
      console.error("Lỗi khi tải thêm Posts:", error);
      set({ isFetchingMore: false });
    }
  },
}));
