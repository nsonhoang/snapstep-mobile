import {
  FieldValue,
  Timestamp,
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  where,
  DocumentSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { ImageService } from "./imageService";
import { UserService } from "./userService";
import { TripService } from "./tripService";

export interface Post {
  authorId: string; // sẽ gán băng userId
  imageUrl: string; //
  // thumbnailUrl: string; // Dùng vẽ Marker trên Map cho nhẹ
  like: number;
  love: number;
  hate: number;
  haha: number;
  caption?: string;
  tripId: string;
  location: Location | null;
  shareToMap?: boolean;
  createdAt: Timestamp | FieldValue;
  updateAt: Timestamp | FieldValue;
}

export interface PostWithId extends Post {
  id: string; // Thêm ID document
}

export interface Location {
  latitude: number;
  longitude: number;
  // provinceCode: string | null;
  // provinceName: string | null;
  // placeName: string | null;
  address: string | null;
}

interface FirestoreTimestampLike {
  toMillis?: () => number;
  toDate?: () => Date;
  seconds?: number;
}

interface FirestoreQueryError extends Error {
  code?: string;
}

// Hàm trợ giúp chuyển đổi thời gian Firestore an toàn (Tuân thủ Zero any policy)
const getTimestampMillis = (
  createdAt: Timestamp | FieldValue | FirestoreTimestampLike | undefined,
): number => {
  if (!createdAt) return Date.now();
  const ts = createdAt as FirestoreTimestampLike;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts.toDate === "function") return ts.toDate().getTime();
  if (typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
};

export const PostService = {
  // Lắng nghe Realtime danh sách Post với onSnapshot
  subscribeToPosts: (
    limitCount: number,
    authorIdOrIds: string | string[] | undefined,
    onUpdate: (posts: PostWithId[]) => void,
  ) => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    let q;

    if (Array.isArray(authorIdOrIds)) {
      if (authorIdOrIds.length === 0) {
        onUpdate([]);
        return () => {};
      }
      // Giới hạn tối đa 30 phần tử theo quy định của Firestore
      const validIds = authorIdOrIds.slice(0, 30);
      if (validIds.length === 1) {
        // Với 1 tác giả duy nhất (thường là chính mình), dùng '==' thay vì 'in'
        q = query(
          postsRef,
          where("authorId", "==", validIds[0]),
          limit(limitCount),
        );
      } else {
        q = query(
          postsRef,
          where("authorId", "in", validIds),
          limit(limitCount),
        );
      }
    } else if (authorIdOrIds) {
      q = query(
        postsRef,
        where("authorId", "==", authorIdOrIds),
        limit(limitCount),
      );
    } else {
      // Khi không truyền authorId, không query tự do để tránh vi phạm Security Rules (permission-denied)
      onUpdate([]);
      return () => {};
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate([]);
          return;
        }

        const posts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PostWithId[];

        // Sắp xếp bài viết giảm dần theo thời gian tạo (mới nhất lên đầu)
        posts.sort(
          (a, b) =>
            getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt),
        );

        onUpdate(posts);
      },
      (error: FirestoreQueryError) => {
        console.error("Lỗi Realtime Posts:", error.code, error.message, error);
      },
    );

    return unsubscribe;
  },

  // Hàm tải lần đầu
  getPosts: async (
    limitCount: number,
    authorIdOrIds?: string | string[],
  ): Promise<{ posts: PostWithId[]; lastDoc: DocumentSnapshot | null }> => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    let q;

    if (Array.isArray(authorIdOrIds)) {
      if (authorIdOrIds.length === 0) return { posts: [], lastDoc: null };
      const validIds = authorIdOrIds.slice(0, 30);
      if (validIds.length === 1) {
        q = query(
          postsRef,
          where("authorId", "==", validIds[0]),
          limit(limitCount),
        );
      } else {
        q = query(
          postsRef,
          where("authorId", "in", validIds),
          limit(limitCount),
        );
      }
    } else if (authorIdOrIds) {
      q = query(
        postsRef,
        where("authorId", "==", authorIdOrIds),
        limit(limitCount),
      );
    } else {
      return { posts: [], lastDoc: null };
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) return { posts: [], lastDoc: null };

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PostWithId[];

    // Sắp xếp bài viết giảm dần theo thời gian tạo
    posts.sort(
      (a, b) =>
        getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt),
    );

    return { posts, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  },

  // Hàm tải thêm khi lướt (có startAfter)
  getMorePosts: async (
    limitCount: number,
    lastDocSnap: DocumentSnapshot,
    authorIdOrIds?: string | string[],
  ): Promise<{ posts: PostWithId[]; lastDoc: DocumentSnapshot | null }> => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    let q;

    if (Array.isArray(authorIdOrIds)) {
      if (authorIdOrIds.length === 0) return { posts: [], lastDoc: null };
      const validIds = authorIdOrIds.slice(0, 30);
      if (validIds.length === 1) {
        q = query(
          postsRef,
          where("authorId", "==", validIds[0]),
          startAfter(lastDocSnap),
          limit(limitCount),
        );
      } else {
        q = query(
          postsRef,
          where("authorId", "in", validIds),
          startAfter(lastDocSnap),
          limit(limitCount),
        );
      }
    } else if (authorIdOrIds) {
      q = query(
        postsRef,
        where("authorId", "==", authorIdOrIds),
        startAfter(lastDocSnap),
        limit(limitCount),
      );
    } else {
      return { posts: [], lastDoc: null };
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) return { posts: [], lastDoc: null };

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PostWithId[];

    // Sắp xếp bài viết giảm dần theo thời gian tạo
    posts.sort(
      (a, b) =>
        getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt),
    );

    return { posts, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  },

  // Lấy chi tiết bài viết theo ID
  getPostById: async (id: string): Promise<PostWithId | null> => {
    try {
      const db = getFirestore();
      const postsRef = collection(db, "posts");
      const postSnap = await getDoc(doc(postsRef, id));
      if (postSnap.exists()) {
        return {
          id: postSnap.id,
          ...(postSnap.data() as Post),
        };
      }
      return null;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin bài viết theo ID:", error);
      return null;
    }
  },

  createPost: async (post: Post): Promise<string> => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    const docRef = await addDoc(postsRef, post);
    console.log("Post created successfully with ID:", docRef.id);

    // Tự động tăng số lượng ảnh (+1) cho tác giả và thêm bài viết vào chuyến đi
    try {
      if (post.authorId) {
        await UserService.incrementPhotosCount(post.authorId);
      }
      if (post.tripId) {
        await TripService.addPostToTrip(post.tripId, docRef.id);
      }
    } catch (statsError) {
      console.warn("Lỗi khi cập nhật thống kê người dùng hoặc hành trình:", statsError);
    }

    return docRef.id;
  },

  deletePost: async (id: string): Promise<void> => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    const postSnap = await getDoc(doc(postsRef, id));
    if (postSnap.exists()) {
      const postData = postSnap.data();
      const imageUrl = postData?.imageUrl;
      const authorId = postData?.authorId;
      const tripId = postData?.tripId;

      await deleteDoc(doc(postsRef, id));
      console.log("Post deleted successfully");

      // Xóa hình ảnh khỏi storage
      if (imageUrl) {
        try {
          await ImageService.deleteImage(imageUrl);
        } catch (imgError) {
          console.error("Lỗi khi xóa ảnh trên Storage:", imgError);
        }
      }

      // Giảm số lượng ảnh (-1) và gỡ bài viết khỏi chuyến đi
      try {
        if (authorId) {
          await UserService.decrementPhotosCount(authorId);
        }
        if (tripId) {
          await TripService.removePostFromTrip(tripId, id);
        }
      } catch (statsError) {
        console.warn("Lỗi khi giảm thống kê hoặc gỡ bài khỏi hành trình:", statsError);
      }
    }
  },
};
