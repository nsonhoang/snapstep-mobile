import { create } from "zustand";
import { Timestamp } from "@react-native-firebase/firestore";
import { getAuth } from "@react-native-firebase/auth";
import {
  FriendshipService,
  FriendRelationship,
} from "../services/friendshipService";
import { UserService, UserWithId } from "../services/userService";

interface FriendshipState {
  relationships: Record<string, FriendRelationship>;
  friends: UserWithId[];
  incomingRequests: UserWithId[];
  searchResults: UserWithId[];
  isSearching: boolean;
  isLoading: boolean;

  searchUsers: (queryText: string, currentUserId: string) => Promise<void>;
  clearSearch: () => void;
  sendRequest: (currentUserId: string, targetUid: string) => Promise<void>;
  cancelRequest: (currentUserId: string, targetUid: string) => Promise<void>;
  acceptRequest: (currentUserId: string, targetUid: string) => Promise<void>;
  rejectRequest: (currentUserId: string, targetUid: string) => Promise<void>;
  unfriend: (currentUserId: string, targetUid: string) => Promise<void>;
  subscribeFriends: (currentUserId: string) => () => void;
}

export const useFriendshipStore = create<FriendshipState>((set, get) => {
  // Hàm trợ giúp nội bộ: Xóa quan hệ khỏi state để giao diện phản hồi tức thì
  const removeRelationshipFromState = (targetUid: string) => {
    set((state) => {
      const nextRel = { ...state.relationships };
      delete nextRel[targetUid];
      return {
        relationships: nextRel,
        friends: state.friends.filter((f) => f.id !== targetUid),
        incomingRequests: state.incomingRequests.filter((u) => u.id !== targetUid),
      };
    });
  };

  return {
    relationships: {},
    friends: [],
    incomingRequests: [],
    searchResults: [],
    isSearching: false,
    isLoading: false,

    // Tìm kiếm người dùng qua email hoặc họ tên
    searchUsers: async (queryText: string, currentUserId: string) => {
      const clean = queryText.trim();
      if (!clean) {
        set({ searchResults: [], isSearching: false });
        return;
      }

      set({ isSearching: true });
      try {
        const myUid = currentUserId || getAuth().currentUser?.uid || "";
        const results = await UserService.searchUsers(clean, myUid);
        // Lọc kỹ phía client để chắc chắn 100% không bao giờ xuất hiện chính mình
        const filtered = myUid ? results.filter((u) => u.id !== myUid) : results;
        set({ searchResults: filtered, isSearching: false });
      } catch (error) {
        console.error("Lỗi khi tìm kiếm người dùng:", error);
        set({ isSearching: false });
      }
    },

    clearSearch: () => {
      set({ searchResults: [], isSearching: false });
    },

    // Gửi lời mời kết bạn (Cập nhật lạc quan)
    sendRequest: async (currentUserId: string, targetUid: string) => {
      try {
        await FriendshipService.sendFriendRequest(currentUserId, targetUid);
        set((state) => ({
          relationships: {
            ...state.relationships,
            [targetUid]: {
              status: "outgoing_pending",
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            },
          },
        }));
      } catch (error) {
        console.error("Lỗi khi gửi lời mời kết bạn:", error);
      }
    },

    // Hủy lời mời kết bạn đã gửi
    cancelRequest: async (currentUserId: string, targetUid: string) => {
      try {
        await FriendshipService.cancelFriendRequest(currentUserId, targetUid);
        removeRelationshipFromState(targetUid);
      } catch (error) {
        console.error("Lỗi khi hủy lời mời kết bạn:", error);
      }
    },

    // Chấp nhận lời mời kết bạn
    acceptRequest: async (currentUserId: string, targetUid: string) => {
      try {
        await FriendshipService.acceptFriendRequest(currentUserId, targetUid);
        set((state) => ({
          relationships: {
            ...state.relationships,
            [targetUid]: {
              ...(state.relationships[targetUid] || {}),
              status: "accepted",
              updatedAt: Timestamp.now(),
            },
          },
        }));
      } catch (error) {
        console.error("Lỗi khi chấp nhận kết bạn:", error);
      }
    },

    // Từ chối lời mời kết bạn
    rejectRequest: async (currentUserId: string, targetUid: string) => {
      try {
        await FriendshipService.rejectFriendRequest(currentUserId, targetUid);
        removeRelationshipFromState(targetUid);
      } catch (error) {
        console.error("Lỗi khi từ chối kết bạn:", error);
      }
    },

    // Hủy kết bạn (Unfriend)
    unfriend: async (currentUserId: string, targetUid: string) => {
      try {
        await FriendshipService.unfriend(currentUserId, targetUid);
        removeRelationshipFromState(targetUid);
      } catch (error) {
        console.error("Lỗi khi hủy kết bạn:", error);
      }
    },

    // Lắng nghe realtime các mối quan hệ bạn bè của user hiện tại
    subscribeFriends: (currentUserId: string) => {
      if (!currentUserId) return () => {};

      set({ isLoading: true });

      const unsubscribe = FriendshipService.subscribeUserRelationships(
        currentUserId,
        async (relationshipsMap) => {
          const acceptedUids: string[] = [];
          const incomingUids: string[] = [];

          Object.entries(relationshipsMap).forEach(([targetUid, rel]) => {
            // Tuyệt đối loại bỏ nếu có document tự kết bạn với chính mình
            if (targetUid === currentUserId) {
              FriendshipService.unfriend(currentUserId, currentUserId).catch(() => {});
              return;
            }

            if (rel.status === "accepted") {
              acceptedUids.push(targetUid);
            } else if (rel.status === "incoming_pending") {
              incomingUids.push(targetUid);
            }
          });

          const allTargetUids = Array.from(
            new Set([...acceptedUids, ...incomingUids]),
          );

          if (allTargetUids.length === 0) {
            set({
              relationships: relationshipsMap,
              friends: [],
              incomingRequests: [],
              isLoading: false,
            });
            return;
          }

          // Tải thông tin hồ sơ của các user trong danh sách
          const usersInfoMap = await UserService.getUsersByIds(allTargetUids);

          const friendsList: UserWithId[] = acceptedUids
            .map((uid) => usersInfoMap[uid])
            .filter((u): u is UserWithId => Boolean(u));

          const incomingList: UserWithId[] = incomingUids
            .map((uid) => usersInfoMap[uid])
            .filter((u): u is UserWithId => Boolean(u));

          set({
            relationships: relationshipsMap,
            friends: friendsList,
            incomingRequests: incomingList,
            isLoading: false,
          });
        },
        (err) => {
          console.error("Lỗi đăng ký theo dõi bạn bè:", err);
          set({ isLoading: false });
        },
      );

      return unsubscribe;
    },
  };
});
