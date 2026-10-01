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
  doc,
  getDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "@react-native-firebase/firestore";

export interface Trip {
  userId: string;
  title: string;
  like: number;
  love: number;
  hate: number;
  description?: string;
  coverImageUrl?: string;
  details: TripDetail[];
  postIds: string[];
  status: TripStatus;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface TripWithId extends Trip {
  id: string; // Thêm ID document
}

type TripStatus = "planning" | "ongoing" | "completed" | "another" | "cancle";

export interface TripDetail {
  time: Timestamp;
  describe: string;
}

export const TripService = {
  // Hàm tải lần đầu
  getTrips: async (
    limitCount: number,
    userId?: string,
  ): Promise<{ trips: TripWithId[]; lastDoc: DocumentSnapshot | null }> => {

    // Khi không truyền userId, không query tự do để tránh vi phạm Security Rules (permission-denied)
    if (!userId) return { trips: [], lastDoc: null };

    const db = getFirestore();
    const tripsRef = collection(db, "trips");
    const q = query(
      tripsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return { trips: [], lastDoc: null };

    const trips = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TripWithId[];

    return { trips, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  },

  // Hàm tải thêm khi lướt (có startAfter)
  getMoreTrips: async (
    limitCount: number,
    lastDocSnap: DocumentSnapshot,
    userId?: string,
  ): Promise<{ trips: TripWithId[]; lastDoc: DocumentSnapshot | null }> => {

    // Khi không truyền userId, không query tự do để tránh vi phạm Security Rules (permission-denied)
    if (!userId) return { trips: [], lastDoc: null };

    const db = getFirestore();
    const tripsRef = collection(db, "trips");
    const q = query(
      tripsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      startAfter(lastDocSnap),
      limit(limitCount),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return { trips: [], lastDoc: null };

    const trips = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TripWithId[];

    return { trips, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  },

  // Lấy chi tiết chuyến đi theo ID
  getTripById: async (tripId: string): Promise<TripWithId | null> => {
    if (!tripId) return null;
    try {
      const db = getFirestore();
      const tripRef = doc(db, "trips", tripId);
      const tripSnap = await getDoc(tripRef);
      if (tripSnap.exists()) {
        return {
          id: tripSnap.id,
          ...(tripSnap.data() as Trip),
        };
      }
      return null;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin chuyến đi ${tripId}:`, error);
      return null;
    }
  },

  // Cập nhật thông tin chuyến đi
  updateTrip: async (tripId: string, data: Partial<Trip>): Promise<void> => {
    if (!tripId) return;
    try {
      const db = getFirestore();
      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      console.log(`Cập nhật chuyến đi ${tripId} thành công`);
    } catch (error) {
      console.error(`Lỗi khi cập nhật chuyến đi ${tripId}:`, error);
      throw error;
    }
  },

  // Tạo chuyến đi mới và trả về ID document
  createTrip: async (trip: Trip): Promise<string> => {
    const db = getFirestore();
    const tripsRef = collection(db, "trips");
    const docRef = await addDoc(tripsRef, trip);
    console.log("Tạo chuyến đi thành công với ID:", docRef.id);
    return docRef.id;
  },

  // Thêm postId vào mảng postIds của chuyến đi
  addPostToTrip: async (tripId: string, postId: string): Promise<void> => {
    if (!tripId || !postId) return;
    try {
      const db = getFirestore();
      const tripRef = doc(db, "trips", tripId);
      await setDoc(
        tripRef,
        {
          postIds: FieldValue.arrayUnion(postId),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error(`Lỗi khi thêm bài viết vào chuyến đi ${tripId}:`, error);
    }
  },

  // Gỡ postId khỏi mảng postIds của chuyến đi khi xóa bài viết
  removePostFromTrip: async (tripId: string, postId: string): Promise<void> => {
    if (!tripId || !postId) return;
    try {
      const db = getFirestore();
      const tripRef = doc(db, "trips", tripId);
      await setDoc(
        tripRef,
        {
          postIds: FieldValue.arrayRemove(postId),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error(`Lỗi khi gỡ bài viết khỏi chuyến đi ${tripId}:`, error);
    }
  },
};
