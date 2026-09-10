import {
  FieldValue,
  Timestamp,
  getFirestore,
  collection,
  query,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  ghostMode: boolean;
  stats: UserStats;
  avatarUrl?: string;
  bio?: string;
  username?: string;
  conqueredProvinces?: Record<string, ProvinceInfo>;
}

export interface UserWithId extends User {
  id: string;
}

export interface UserStats {
  conqueredProvincesCount: number;
  totalPhotosCount: number;
}

export interface ProvinceInfo {
  unlockedAt: Timestamp | FieldValue;
  firstPhotoId: string;
}

export const UserService = {
  // Tìm kiếm người dùng theo email hoặc tên hiển thị (loại trừ chính mình)
  searchUsers: async (
    queryText: string,
    currentUserId: string,
  ): Promise<UserWithId[]> => {
    const trimmed = queryText.trim().toLowerCase();
    if (!trimmed) return [];

    const authUid = currentUserId || getAuth().currentUser?.uid || "";
    const db = getFirestore();
    const usersRef = collection(db, "users");

    // Lấy tối đa 25 người dùng để lọc tìm kiếm phía client
    const q = query(usersRef, limit(25));
    const snapshot = await getDocs(q);

    const results: UserWithId[] = [];
    snapshot.forEach((d) => {
      if (authUid && d.id === authUid) return; // Bỏ qua chính bản thân mình

      const data = d.data() as User;
      const fullName = `${data.firstName || ""} ${data.lastName || ""}`.toLowerCase();
      const email = (data.email || "").toLowerCase();
      const username = (data.username || "").toLowerCase();

      if (
        email.includes(trimmed) ||
        fullName.includes(trimmed) ||
        username.includes(trimmed)
      ) {
        results.push({
          id: d.id,
          ...data,
        });
      }
    });

    return results;
  },

  // Lấy thông tin chi tiết của danh sách user theo mảng UID
  getUsersByIds: async (
    userIds: string[],
  ): Promise<Record<string, UserWithId>> => {
    if (!userIds || userIds.length === 0) return {};

    const db = getFirestore();
    const map: Record<string, UserWithId> = {};

    await Promise.all(
      userIds.map(async (uid) => {
        try {
          const userDoc = await getDoc(doc(db, "users", uid));
          if (userDoc.exists()) {
            map[uid] = {
              id: userDoc.id,
              ...(userDoc.data() as User),
            };
          }
        } catch (err) {
          console.error(`Lỗi khi lấy thông tin user ${uid}:`, err);
        }
      }),
    );

    return map;
  },

  // Lấy thông tin hồ sơ của một user theo UID
  getUserProfile: async (uid: string): Promise<UserWithId | null> => {
    if (!uid) return null;
    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...(userDoc.data() as User),
        };
      }
      return null;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin user ${uid}:`, error);
      return null;
    }
  },

  // Lắng nghe realtime sự thay đổi thông tin hồ sơ của một user
  subscribeUserProfile: (
    uid: string,
    onUpdate: (user: UserWithId | null) => void,
  ) => {
    if (!uid) {
      onUpdate(null);
      return () => {};
    }

    const db = getFirestore();
    const userRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate({
            id: snapshot.id,
            ...(snapshot.data() as User),
          });
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        console.error(`Lỗi lắng nghe realtime user ${uid}:`, error);
      },
    );

    return unsubscribe;
  },

  // Cập nhật thông tin hồ sơ người dùng trong Firestore
  updateUserProfile: async (
    uid: string,
    data: Partial<User>,
  ): Promise<boolean> => {
    if (!uid) return false;
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", uid);
      // Dùng setDoc với merge: true để vừa hỗ trợ tạo mới vừa cập nhật an toàn
      await setDoc(
        userRef,
        {
          ...data,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      return true;
    } catch (error) {
      console.error(`Lỗi cập nhật hồ sơ user ${uid}:`, error);
      return false;
    }
  },
};
