import { useEffect } from 'react';
import {
  getMessaging,
  getInitialNotification,
  onNotificationOpenedApp,
  onTokenRefresh,
  RemoteMessage,
} from '@react-native-firebase/messaging';
import { navigationRef } from '../navigation/navigationRef';
import { useAuthStore } from '../stores/authStore';
import { NotificationService } from '../services/notificationService';

export const usePushNotifications = (): void => {
  const user = useAuthStore((state) => state.user);

  // Xử lý điều hướng khi người dùng nhấn vào thông báo
  const handleNotificationNavigation = (remoteMessage: RemoteMessage) => {
    const data = remoteMessage.data;
    if (!data?.type || !navigationRef.isReady()) return;

    switch (data.type) {
      case 'chat_message':
        if (data.senderId || data.chatId) {
          navigationRef.navigate('Chat', {
            recipientId: (data.senderId || data.chatId) as string,
            recipientName: (data.senderName as string) || 'Bạn bè',
          });
        }
        break;
      case 'friend_request':
        navigationRef.navigate('SearchBuddies');
        break;
      default:
        navigationRef.navigate('Notifications');
        break;
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    // 1. Xin quyền & Lưu FCM Token lên Firestore
    NotificationService.requestUserPermission().then((hasPermission) => {
      if (hasPermission && user.uid) {
        NotificationService.syncFCMToken(user.uid);
      }
    });

    const messaging = getMessaging();

    // 2. Lắng nghe thông báo khi đang mở app (Foreground)
    const unsubscribeForeground = NotificationService.subscribeForegroundMessages(
      (remoteMessage) => {
        console.log('🔔 Nhận thông báo Foreground:', remoteMessage.notification?.title);
      }
    );

    // 3. Khi bấm vào thông báo khi app đang chạy ngầm (Background)
    const unsubscribeOpenedApp = onNotificationOpenedApp(messaging, (remoteMessage) => {
      console.log('📩 Người dùng mở thông báo từ background:', remoteMessage);
      handleNotificationNavigation(remoteMessage);
    });

    // 4. Khi bấm vào thông báo mở app từ trạng thái tắt hoàn toàn (Cold start)
    getInitialNotification(messaging).then((remoteMessage) => {
      if (remoteMessage) {
        console.log('🚀 Mở app từ thông báo cold start:', remoteMessage);
        handleNotificationNavigation(remoteMessage);
      }
    });

    // 5. Tự động cập nhật nếu Token thay đổi
    const unsubscribeTokenRefresh = onTokenRefresh(messaging, (newToken) => {
      if (user.uid) {
        NotificationService.syncFCMToken(user.uid);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeOpenedApp();
      unsubscribeTokenRefresh();
    };
  }, [user?.uid]);
};
