import {
  FieldValue,
  Timestamp,
  getFirestore,
  doc,
  collection,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "@react-native-firebase/firestore";

// Các trạng thái của mối quan hệ trong Subcollection: friendships/{userId}/friends/{friendId}
export type FriendshipStatus =
  | "outgoing_pending" // Mình gửi lời mời cho họ, đang chờ họ chấp nhận
  | "incoming_pending" // Họ gửi lời mời cho mình, đang chờ mình duyệt trong mục Invited
  | "accepted"         // Đã là bạn bè chính thức
  | "blocked";         // Đã chặn

export interface FriendRelationship {
  status: FriendshipStatus;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// Hàm trợ giúp nội bộ: Xóa cặp document 2 chiều giữa 2 người dùng
const deleteRelationshipPair = async (myUid: string, targetUid: string): Promise<void> => {
  if (!myUid || !targetUid) return;

  const db = getFirestore();
  const batch = writeBatch(db);

  const myDocRef = doc(db, "friendships", myUid, "friends", targetUid);
  const targetDocRef = doc(db, "friendships", targetUid, "friends", myUid);

  batch.delete(myDocRef);
  batch.delete(targetDocRef);

  await batch.commit();
};

export const FriendshipService = {
  // Gửi lời mời kết bạn (Cập nhật 2 chiều đồng thời qua writeBatch)
  sendFriendRequest: async (myUid: string, targetUid: string): Promise<void> => {
    if (!myUid || !targetUid || myUid === targetUid) return;

    const db = getFirestore();
    const batch = writeBatch(db);
    const now = serverTimestamp();

    // 1. Phía người gửi: lưu trạng thái là đã gửi
    const myDocRef = doc(db, "friendships", myUid, "friends", targetUid);
    batch.set(myDocRef, {
      status: "outgoing_pending",
      createdAt: now,
      updatedAt: now,
    });

    // 2. Phía người nhận: lưu trạng thái là lời mời nhận được (Invited)
    const targetDocRef = doc(db, "friendships", targetUid, "friends", myUid);
    batch.set(targetDocRef, {
      status: "incoming_pending",
      createdAt: now,
      updatedAt: now,
    });

    await batch.commit();
  },

  // Hủy lời mời kết bạn đã gửi
  cancelFriendRequest: async (myUid: string, targetUid: string): Promise<void> => {
    return deleteRelationshipPair(myUid, targetUid);
  },

  // Chấp nhận lời mời kết bạn (Chuyển cả 2 bên thành "accepted")
  acceptFriendRequest: async (myUid: string, targetUid: string): Promise<void> => {
    if (!myUid || !targetUid) return;

    const db = getFirestore();
    const batch = writeBatch(db);
    const now = serverTimestamp();

    const myDocRef = doc(db, "friendships", myUid, "friends", targetUid);
    const targetDocRef = doc(db, "friendships", targetUid, "friends", myUid);

    batch.update(myDocRef, {
      status: "accepted",
      updatedAt: now,
    });

    batch.update(targetDocRef, {
      status: "accepted",
      updatedAt: now,
    });

    await batch.commit();
  },

  // Từ chối lời mời kết bạn
  rejectFriendRequest: async (myUid: string, targetUid: string): Promise<void> => {
    return deleteRelationshipPair(myUid, targetUid);
  },

  // Hủy kết bạn (Unfriend)
  unfriend: async (myUid: string, targetUid: string): Promise<void> => {
    return deleteRelationshipPair(myUid, targetUid);
  },

  // Lắng nghe realtime toàn bộ danh sách quan hệ bạn bè của một user
  subscribeUserRelationships: (
    myUid: string,
    onUpdate: (data: Record<string, FriendRelationship>) => void,
    onError?: (err: Error) => void,
  ): (() => void) => {
    if (!myUid) return () => {};

    const db = getFirestore();
    const friendsCollRef = collection(db, "friendships", myUid, "friends");

    return onSnapshot(
      friendsCollRef,
      (snapshot) => {
        const result: Record<string, FriendRelationship> = {};
        snapshot.forEach((d) => {
          result[d.id] = d.data() as FriendRelationship;
        });
        onUpdate(result);
      },
      (error) => {
        console.error("Lỗi khi theo dõi realtime danh sách bạn bè:", error);
        if (onError) onError(error);
      },
    );
  },
};