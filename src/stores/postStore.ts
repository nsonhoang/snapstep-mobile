import { create } from "zustand";
import { DocumentSnapshot } from "@react-native-firebase/firestore";
import { PostWithId, PostService } from "../services/postService";

interface PostState {
  posts: PostWithId[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  limitCount: number;

  subscribePosts: (authorId?: string) => () => void;
  fetchMorePosts: (authorId?: string) => void;
  removePost: (postId: string) => void;
}

const INITIAL_LIMIT = 10;
let unsubscribeSnapshot: (() => void) | null = null;

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  isFetchingMore: false,
  hasMore: true,
  limitCount: INITIAL_LIMIT,

  subscribePosts: (authorId?: string) => {
    set({ isLoading: true, limitCount: INITIAL_LIMIT });

    // Hủy lắng nghe cũ (nếu có) trước khi tạo mới
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
    }

    unsubscribeSnapshot = PostService.subscribeToPosts(
      INITIAL_LIMIT,
      authorId,
      (posts) => {
        set({
          posts,
          isLoading: false,
          isFetchingMore: false,
          hasMore: posts.length >= get().limitCount,
        });
      },
    );

    // Trả về hàm hủy để Component (ExploreScreen) có thể dọn dẹp khi Unmount
    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
    };
  },

  fetchMorePosts: (authorId?: string) => {
    const { isFetchingMore, hasMore, limitCount } = get();

    // Nếu đang tải thêm hoặc không còn bài, thì bỏ qua
    if (isFetchingMore || !hasMore) return;

    const newLimit = limitCount + 10;
    set({ isFetchingMore: true, limitCount: newLimit });

    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
    }

    unsubscribeSnapshot = PostService.subscribeToPosts(
      newLimit,
      authorId,
      (posts) => {
        set({
          posts,
          isFetchingMore: false,
          // Kiểm tra xem số lượng lấy về có đáp ứng đủ giới hạn mới không
          hasMore: posts.length >= newLimit,
        });
      },
    );
  },

  removePost: (postId: string) => {
    // Với onSnapshot, khi xóa trên server, danh sách tự cập nhật ngay lập tức.

    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));
  },
}));
