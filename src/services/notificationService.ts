import { AuthorizationStatus, getMessaging, RemoteMessage, requestPermission } from '@react-native-firebase/messaging';

import { collection, deleteDoc, doc, FieldValue, getDocs, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, startAfter, Timestamp, updateDoc, where, writeBatch } from "@react-native-firebase/firestore";
import { PermissionsAndroid, Platform } from "react-native";

export type NotificationType =  | 'chat_message'       // Có tin nhắn mới
  | 'friend_request'    // Lời mời kết bạn
  | 'friend_accepted'   // Đã chấp nhận kết bạn
  | 'new_snap'          // Bạn bè đăng bài mới
  | 'streak_reminder'  // Nhắc nhở khám phá
  | 'other' // Truờng hợp khác

  export interface Notification {
   
    type: NotificationType;
    senderId?: string;
    senderName?: string;
    chatId?: string;
    postId?: string;
    [key: string]: string | undefined;
    
  }
  export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  chatId?: string;
  postId?: string;
  isRead: boolean;
  createdAt: Timestamp | FieldValue;
}

export interface CreateNotificationParams {
  recipientId: string;       // UID người nhận thông báo
  type: NotificationType;    // 'chat_message' | 'friend_request' | 'friend_accepted' | 'new_snap'...
  title: string;             // Tiêu đề: "Linh Nguyễn"
  body: string;              // Nội dung: "Đã gửi cho bạn một lời mời kết bạn"
  senderId?: string;         // UID người gửi
  senderName?: string;       // Tên người gửi
  senderAvatar?: string;     // Ảnh đại diện người gửi
  chatId?: string;           // Dùng để điều hướng nếu là tin nhắn chat
  postId?: string;           // Dùng để điều hướng nếu là bài viết mới
}


export const NotificationService = {
  createNotification:async(params : CreateNotificationParams):Promise<string | null> =>{
    if(!params.recipientId){
      return null
    }

    try {
      const db = getFirestore()
      const notiRef = collection(db,'users', params.recipientId,'notifications');
      const newDoc = doc(notiRef)
      // nếu là tin nhắn thì có thể
      if(params.type !== 'chat_message' )
      await setDoc(newDoc,{
      type:params.type,
      title:params.title,
      body:params.body,
      senderId: params.senderId || null,
      senderName: params.senderName || null,
      senderAvatar: params.senderAvatar || null,
       postId: params.postId || null,
      isRead: false,
      createdAt: serverTimestamp(),

      })
      console.log('Đã tạo thông báo Firestore thành công cho:', params.recipientId);
    return newDoc.id;
    } catch (error) {
        console.error(' Lỗi khi tạo thông báo:', error);
    return null;
    }

  },
  

  requestUserPermission: async() : Promise<boolean>=>{
    try {
        if(Platform.OS === 'android'){
            if(Platform.Version >=33){
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                )
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            return true;
        }else{
            const messaging = getMessaging()
            const authStatus = await requestPermission(messaging)
            return (
                authStatus === AuthorizationStatus.AUTHORIZED ||
                authStatus === AuthorizationStatus.PROVISIONAL
            )
        }
    } catch (error) {
         console.error('Lỗi xin quyền thông báo:', error);
      return false;
    }


  },

  // Lấy FCM token 
  syncFCMToken: async (uid: string): Promise<string | null> => {
   if (!uid) return null;
    try {
        // ios cần xử lí khác
        if(Platform.OS === "ios" && !getMessaging().isDeviceRegisteredForRemoteMessages ){
         await getMessaging().registerDeviceForRemoteMessages();   
        }

        const token = await getMessaging().getToken();
        if(token){
            const db = getFirestore();
           const userRef = doc(collection(db,'users'), uid)
            await setDoc(
                userRef, 
                {
                    fcmToken: FieldValue.arrayUnion(token),
                    updatedAt: serverTimestamp()
                },
                {merge: true}
            );
            console.log('FCM token saved:', token);
            return token;
            
        }
        return null;
    } catch (error) {
         console.error('Lỗi khi lấy và lưu FCM Token:', error);
      return null;
    }

  },
  // remove token khi logout
  removeFCMToken :async(uid: string): Promise<void>=>{ 

     if (!uid) return;
     try {
         // xóa tokenFCM trên máy 
         const messaging = getMessaging();
         const token = await messaging.getToken();
         
         if(token){
            const db = getFirestore();
            const userRef = doc(collection(db,'users'), uid)
            await setDoc(
                userRef,
                {
                    fcmToken: FieldValue.arrayRemove(token),
                    updatedAt: serverTimestamp()
                },
                {merge: true}
            );
            await messaging.deleteToken();
        
            console.log('FCM token removed:', token);
          
         }
     } catch (error) {
         console.error('Lỗi khi xoá FCM Token:', error);
     }
  },
    subscribeForegroundMessages: (
    onMessageReceived: (message:RemoteMessage) => void
  ) => {
    return getMessaging().onMessage(async (remoteMessage) => {
      console.log('🔔 Nhận thông báo Foreground:', remoteMessage);
      onMessageReceived(remoteMessage);
    });
  },

  subscribeNotifications: (
    uid: string,
    onUpdate: (notifications: NotificationItem[]) => void,
    limitCount: number = 30
  ): (() => void) => {
    if (!uid) return () => {};
    try {
      const db = getFirestore();
      const notiRef = collection(db, 'users', uid, 'notifications');
      const q = query(notiRef, orderBy('createdAt', 'desc'), limit(limitCount));

      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot || snapshot.empty) {
            onUpdate([]);
            return;
          }
          const items: NotificationItem[] = [];
          snapshot.forEach((d) => {
            items.push({
              id: d.id,
              ...(d.data() as Omit<NotificationItem, 'id'>),
            });
          });
          onUpdate(items);
        },
        (error) => {
          console.error('❌ Lỗi khi lắng nghe thông báo Firestore:', error);
          onUpdate([]);
        }
      );
    } catch (error) {
      console.error('❌ Lỗi thiết lập subscribeNotifications:', error);
      return () => {};
    }
  },

  markAsRead: async (uid: string, notificationId: string): Promise<void> => {
    if (!uid || !notificationId) return;
    try {
      const db = getFirestore();
      const notiDoc = doc(db, 'users', uid, 'notifications', notificationId);
      await updateDoc(notiDoc, {
        isRead: true,
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật đã đọc:', error);
    }
  },

  deleteNotification: async (uid: string, notificationId: string): Promise<void> => {
    if (!uid ) return;
    try {
      const db = getFirestore();
      if(notificationId){
          const notiDoc = doc(db, 'users', uid, 'notifications', notificationId);
          await deleteDoc(notiDoc);
          return 
      }
    
    
      console.log('Đã xóa thông báo:', notificationId);
    } catch (error) {
      console.error('Lỗi khi xóa thông báo:', error);
    }
  },

  getMoreNotifications: async (
    uid: string,
    lastCreatedAt: Timestamp | FieldValue,
    limitCount: number = 15
  ): Promise<NotificationItem[]> => {
    if (!uid || !lastCreatedAt) return [];
    try {
      const db = getFirestore();
      const notiRef = collection(db, 'users', uid, 'notifications');
      const q = query(
        notiRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastCreatedAt),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const items: NotificationItem[] = [];
      snapshot.forEach((d) => {
        items.push({
          id: d.id,
          ...(d.data() as Omit<NotificationItem, 'id'>),
        });
      });
      return items;
    } catch (error) {
      console.error('Lỗi khi tải thêm thông báo:', error);
      return [];
    }
  },

  deleteNotificationBySenderId :async (
  recieveID: string,
  senderId: string
): Promise<void> => {

  try {
    const db = getFirestore();
    
    // Đường dẫn: users/{myUid}/notifications
    const notiRef = collection(db, 'users', recieveID, 'notifications');
    // Truy vấn: lọc document có trường senderId == senderId
    const q = query(
      notiRef,
      where('senderId', '==', senderId),
      where('type','==',
"friend_request"),
      limit(1) // Lấy 1 cái
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log('Không tìm thấy thông báo nào từ senderId này.');
    
    }
    const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      console.log(`Đã dọn dẹp ${snapshot.size} thông báo từ người gửi:`, senderId);
    } catch (error) {
      console.error('Lỗi khi xóa thông báo bằng batch:', error);
    }
}

}