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
} from "@react-native-firebase/firestore";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  ghostMode: boolean;
  stats: UserStats;
  avatarUrl?: string;
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

    const db = getFirestore();
    const usersRef = collection(db, "users");

    // Lấy tối đa 25 người dùng để lọc tìm kiếm phía client
    const q = query(usersRef, limit(25));
    const snapshot = await getDocs(q);

    const results: UserWithId[] = [];
    snapshot.forEach((d) => {
      if (d.id === currentUserId) return; // Bỏ qua chính bản thân mình

      const data = d.data() as User;
      const fullName = `${data.firstName || ""} ${data.lastName || ""}`.toLowerCase();
      const email = (data.email || "").toLowerCase();

      if (email.includes(trimmed) || fullName.includes(trimmed)) {
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
};
