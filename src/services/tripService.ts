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
};
