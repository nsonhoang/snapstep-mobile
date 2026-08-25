import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, getFirestore } from "@react-native-firebase/firestore";
import { User } from "../services/userService";

interface UserState {
  users: Record<string, User>; // Được lưu vĩnh viễn (Persist)
  isLoadingUsers: Record<string, boolean>; // State tạm thời (RAM)
  sessionFetched: Record<string, boolean>; // Đánh dấu đã gọi mạng trong lần mở app này (RAM)
  fetchUserById: (uid: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: {},
      isLoadingUsers: {},
      sessionFetched: {},

      fetchUserById: async (uid: string) => {
        const { isLoadingUsers, sessionFetched } = get();

        // Tránh dội bom Firebase:
        // 1. Đang gọi mạng rồi thì thôi
        // 2. Hoặc đã gọi 1 lần trong TỪ LÚC MỞ APP ĐẾN GIỜ rồi thì thôi (dùng cache vĩnh viễn)
        if (isLoadingUsers[uid] || sessionFetched[uid]) {
          return;
        }

        // Đánh dấu đang tải mạng
        set((state) => ({
          isLoadingUsers: { ...state.isLoadingUsers, [uid]: true },
        }));

        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "users", uid));

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            set((state) => ({
              users: { ...state.users, [uid]: userData }, // Ghi đè bản mới nhất
              isLoadingUsers: { ...state.isLoadingUsers, [uid]: false },
              sessionFetched: { ...state.sessionFetched, [uid]: true }, // Đánh dấu đã tải trong phiên này
            }));
          } else {
            set((state) => ({
              isLoadingUsers: { ...state.isLoadingUsers, [uid]: false },
              sessionFetched: { ...state.sessionFetched, [uid]: true },
            }));
          }
        } catch (error) {
          console.error(`Lỗi khi tải thông tin user ${uid}:`, error);
          set((state) => ({
            isLoadingUsers: { ...state.isLoadingUsers, [uid]: false },
          }));
        }
      },
    }),
    {
      name: "user-cache-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // CHỈ lưu từ điển `users` xuống AsyncStorage.
      // Không lưu `isLoadingUsers` hay `sessionFetched` (để mỗi lần mở app lại nó được reset và gọi API lại 1 lần duy nhất).
      partialize: (state) => ({ users: state.users }),
    },
  ),
);
