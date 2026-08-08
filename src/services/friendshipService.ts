import { FieldValue, Timestamp } from "@react-native-firebase/firestore";

export interface Friendship {
  //documentID mang userId
   users:[string,string]// 2 id của 2 người
   requesterId:string // id của người yêu cầu 
   status:FriendshipStatus
   createdAt: Timestamp | FieldValue;
   updatedAt: Timestamp | FieldValue;
}

export enum FriendshipStatus {
  PENDING = 'pending', // Đang chờ xử lý
  ACCEPTED = 'accepted', // Đã chấp nhận
  BLOCKED = 'blocked', // Đã chặn
  REJECTED = 'rejected', // Đã từ chối
}