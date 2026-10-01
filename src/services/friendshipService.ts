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
import { CreateNotificationParams, NotificationService } from "./notificationService";

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

    // 3. Tạo thông báo với ID cố định (friend_req_{myUid}) ngay trong Batch để dễ dàng xóa khi hủy lời mời
    const notiDocRef = doc(db, "users", targetUid, "notifications", `friend_req_${myUid}`);
    batch.set(notiDocRef, {
      type: "friend_request",
      title: "Có 1 người muốn kết bạn với bạn",
      body: "Đã gửi cho bạn một lời mời kết bạn.",
      senderId: myUid,
      recipientId: targetUid,
      isRead: false,
      createdAt: now,
    });

    await batch.commit();
  },

  // Hủy lời mời kết bạn đã gửi (Xóa quan hệ 2 bên và xóa luôn thông báo bên hộp thư người nhận)
  cancelFriendRequest: async (myUid: string, targetUid: string): Promise<void> => {
    if (!myUid || !targetUid) return;

    const db = getFirestore();
    const batch = writeBatch(db);

    // 1. Xóa quan hệ bạn bè 2 chiều
    const myDocRef = doc(db, "friendships", myUid, "friends", targetUid);
    const targetDocRef = doc(db, "friendships", targetUid, "friends", myUid);
    batch.delete(myDocRef);
    batch.delete(targetDocRef);

    // 2. Xóa luôn thông báo lời mời trong hộp thư của người nhận
    const notiDocRef = doc(db, "users", targetUid, "notifications", `friend_req_${myUid}`);
    batch.delete(notiDocRef);

    await batch.commit();
  },

  // Chấp nhận lời mời kết bạn (Chuyển cả 2 bên thành "accepted" và gửi thông báo chúc mừng)
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

    // Xóa thông báo lời mời cũ trong hộp thư của chính mình (myUid)
    const oldNotiDocRef = doc(db, "users", myUid, "notifications", `friend_req_${targetUid}`);
    batch.delete(oldNotiDocRef);

    await batch.commit();

    // Gửi thông báo khi chấp nhận lời mời đến người gửi ban đầu
    const notification: CreateNotificationParams = {
      type: "friend_accepted",
      title: "Yêu cầu kết bạn đã được xác nhận",
      body: "Đã chấp nhận lời mời kết bạn của bạn.",
      recipientId: targetUid,
      senderId: myUid,
    };
    await NotificationService.createNotification(notification);
  },

  // Từ chối lời mời kết bạn (Xóa quan hệ 2 bên và xóa thông báo trong hòm thư của mình)
  rejectFriendRequest: async (myUid: string, targetUid: string): Promise<void> => {
    if (!myUid || !targetUid) return;

    const db = getFirestore();
    const batch = writeBatch(db);

    const myDocRef = doc(db, "friendships", myUid, "friends", targetUid);
    const targetDocRef = doc(db, "friendships", targetUid, "friends", myUid);
    const notiDocRef = doc(db, "users", myUid, "notifications", `friend_req_${targetUid}`);

    batch.delete(myDocRef);
    batch.delete(targetDocRef);
    batch.delete(notiDocRef);

    await batch.commit();
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