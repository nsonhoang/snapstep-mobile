import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onValueCreated } from 'firebase-functions/v2/database';
import { setGlobalOptions } from 'firebase-functions/v2';

// 1. Khởi tạo Admin SDK với toàn quyền hệ thống
admin.initializeApp();

// 2. Cấu hình toàn cục: Đặt region asia-southeast1 (Singapore) cùng vùng với RTDB & Firestore của dự án
setGlobalOptions({
  region: 'asia-southeast1',
  maxInstances: 10,
});

/**
 * Hàm hỗ trợ: Tự động xóa các FCM Token đã chết/hết hạn để database luôn sạch sẽ
 */
async function cleanupDeadTokens(
  userId: string,
  tokens: string[],
  response: admin.messaging.BatchResponse
): Promise<void> {
  const deadTokens: string[] = [];
  response.responses.forEach((res, index) => {
    if (res.error) {
      const code = res.error.code;
      if (
        code === 'messaging/invalid-registration-token' ||
        code === 'messaging/registration-token-not-registered'
      ) {
        deadTokens.push(tokens[index]);
      }
    }
  });

  if (deadTokens.length > 0) {
    await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .update({
        fcmToken: admin.firestore.FieldValue.arrayRemove(...deadTokens),
        fcmTokens: admin.firestore.FieldValue.arrayRemove(...deadTokens),
      })
      .catch(() => {});
    console.log(`🧹 Đã dọn dẹp ${deadTokens.length} token không hợp lệ cho user: ${userId}`);
  }
}

/**
 * Trigger 1: Bắn Push Notification khi có thông báo xã hội mới (Kết bạn, Bài viết...)
 */
export const sendSocialNotification = onDocumentCreated(
  'users/{userId}/notifications/{notificationId}',
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const notiData = snap.data();
    const recipientId = event.params.userId;

    // Lấy danh sách fcmTokens của người nhận (hỗ trợ cả fcmToken và fcmTokens)
    const userDoc = await admin.firestore().collection('users').doc(recipientId).get();
    const fcmTokens: string[] = userDoc.data()?.fcmToken || userDoc.data()?.fcmTokens || [];

    if (!fcmTokens || fcmTokens.length === 0) {
      console.log(`ℹ️ User ${recipientId} không có thiết bị nhận push notification.`);
      return;
    }

    const payload: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
      notification: {
        title: notiData.title || 'SnapStep',
        body: notiData.body || 'Bạn có một thông báo mới',
      },
      data: {
        type: String(notiData.type || 'other'),
        senderId: String(notiData.senderId || ''),
        senderName: String(notiData.senderName || ''),
        postId: String(notiData.postId || ''),
        chatId: String(notiData.chatId || ''),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(payload);
    console.log(`✅ [Social] Đã gửi tới ${recipientId}: Thành công ${response.successCount}/${fcmTokens.length}`);

    await cleanupDeadTokens(recipientId, fcmTokens, response);
  }
);

/**
 * Trigger 2: Bắn Push Notification khi có tin nhắn Chat mới
 */
export const sendChatNotification = onValueCreated(
  '/messages/{chatId}/{messageId}',
  async (event) => {
    const message = event.data.val();
    if (!message) return;

    const { senderId, receiverId, replyPost } = message;
    if (!senderId || !receiverId) return;

    // Lấy tên người gửi
    const senderDoc = await admin.firestore().collection('users').doc(senderId).get();
    const senderName = senderDoc.data()?.displayName || senderDoc.data()?.username || 'Bạn bè';

    // Lấy danh sách fcmTokens của người nhận
    const receiverDoc = await admin.firestore().collection('users').doc(receiverId).get();
    const fcmTokens: string[] = receiverDoc.data()?.fcmToken || [];

    if (!fcmTokens || fcmTokens.length === 0) return;

    const bodyText = replyPost ? '📷 Đã gửi cho bạn một ảnh Snap.' : 'Đã gửi cho bạn một tin nhắn mới.';

    const payload: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
      notification: {
        title: senderName,
        body: bodyText,
      },
      data: {
        type: 'chat_message', // Hook useNotification.ts bắt key này để mở thẳng Chat
        senderId: String(senderId),
        senderName: String(senderName),
        chatId: String(event.params.chatId),
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(payload);
    console.log(`✅ [Chat] Đã gửi push chat tới ${receiverId}: Thành công ${response.successCount}/${fcmTokens.length}`);

    await cleanupDeadTokens(receiverId, fcmTokens, response);
  }
);
