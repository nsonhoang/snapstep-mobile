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

export const PostService = {
  // Lắng nghe Realtime danh sách Post với onSnapshot
  subscribeToPosts: (
    limitCount: number,
    authorId: string | undefined,
    onUpdate: (posts: PostWithId[]) => void,
  ) => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    let q;

    if (authorId) {
      q = query(
        postsRef,
        where("authorId", "==", authorId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );
    } else {
      q = query(postsRef, orderBy("createdAt", "desc"), limit(limitCount));
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

        onUpdate(posts);
      },
      (error) => {
        console.error("Lỗi Realtime Posts:", error);
      },
    );

    return unsubscribe;
  },

  // Hàm tải lần đầu
  getPosts: async (
    limitCount: number,
    authorId?: string,
  ): Promise<{ posts: PostWithId[]; lastDoc: DocumentSnapshot | null }> => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    let q;

    if (authorId) {
      q = query(
        postsRef,
        where("authorId", "==", authorId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );
    } else {
      q = query(postsRef, orderBy("createdAt", "desc"), limit(limitCount));
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) return { posts: [], lastDoc: null };

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PostWithId[];

    return { posts, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  },

  // Hàm tải thêm khi lướt (có startAfter)
  getMorePosts: async (
    limitCount: number,
    lastDocSnap: DocumentSnapshot,
    authorId?: string,
  ): Promise<{ posts: PostWithId[]; lastDoc: DocumentSnapshot | null }> => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    let q;

    if (authorId) {
      q = query(
        postsRef,
        where("authorId", "==", authorId),
        orderBy("createdAt", "desc"),
        startAfter(lastDocSnap),
        limit(limitCount),
      );
    } else {
      q = query(
        postsRef,
        orderBy("createdAt", "desc"),
        startAfter(lastDocSnap),
        limit(limitCount),
      );
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) return { posts: [], lastDoc: null };

    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as PostWithId[];

    return { posts, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  },

  createPost: async (post: Post) => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    await addDoc(postsRef, post)
      .then(() => {
        console.log("Post created successfully");
      })
      .catch((error) => {
        console.error("Error creating post:", error);
      });
  },

  deletePost: async (id: string) => {
    const db = getFirestore();
    const postsRef = collection(db, "posts");
    const post = await getDoc(doc(postsRef, id));
    if (post.exists()) {
      const imageUrl = post.data().imageUrl;
      await deleteDoc(doc(postsRef, id))
        .then(() => {
          console.log("Post deleted successfully");
          // xóa hình ảnh khỏi storage
          ImageService.deleteImage(imageUrl);
        })
        .catch((error) => {
          console.error("Error deleting post:", error);
        });
    }
  },
};
