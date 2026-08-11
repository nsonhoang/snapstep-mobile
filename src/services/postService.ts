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
} from "@react-native-firebase/firestore";

export interface Post {
  authorId: string; // sẽ gán băng userId
  imageUrl: string; //
  // thumbnailUrl: string; // Dùng vẽ Marker trên Map cho nhẹ
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
};
