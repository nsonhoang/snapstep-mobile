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
    const db = getFirestore();
    const tripsRef = collection(db, "trips");
    let q;

    if (userId) {
      q = query(
        tripsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );
    } else {
      q = query(tripsRef, orderBy("createdAt", "desc"), limit(limitCount));
    }

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
    const db = getFirestore();
    const tripsRef = collection(db, "trips");
    let q;

    if (userId) {
      q = query(
        tripsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        startAfter(lastDocSnap),
        limit(limitCount),
      );
    } else {
      q = query(
        tripsRef,
        orderBy("createdAt", "desc"),
        startAfter(lastDocSnap),
        limit(limitCount),
      );
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) return { trips: [], lastDoc: null };

    const trips = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TripWithId[];

    return { trips, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
  },

  createTrip: async (trip: Trip) => {
    const db = getFirestore();
    const tripsRef = collection(db, "trips");
    await addDoc(tripsRef, trip)
      .then(() => {
        console.log("Trip created successfully");
      })
      .catch((error) => {
        console.error("Error creating trip:", error);
      });
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
