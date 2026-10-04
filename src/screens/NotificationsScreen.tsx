import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Props, RootStackParamList } from '../navigation/types';
import { NotificationSkeleton } from '../components/NotificationSkeleton';
import { Timestamp } from '@react-native-firebase/firestore';
import { NotificationItem, NotificationService, NotificationType } from '../services/notificationService';
import { useAuthStore } from '../stores/authStore';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from '../i18n';

export const NotificationsScreen = ({ navigation }: Props): React.JSX.Element => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
   const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const formatRelativeTime = (timestamp?: Timestamp | unknown): string => {
  if (!timestamp || !(timestamp instanceof Timestamp)) return 'Vừa xong';
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp.toMillis()) / 1000);
  if (diffSec < 60) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;
  return timestamp.toDate().toLocaleDateString('vi-VN');
};


const renderNotificationIcon = (type: NotificationType): React.JSX.Element => {
  switch (type) {
    case 'friend_request':
      return <Ionicons name="person-add" size={20} color={Colors.primary} />;
    case 'friend_accepted':
      return <Ionicons name="people" size={20} color={Colors.primary} />;
    case 'new_snap':
      return <Ionicons name="camera" size={20} color={Colors.primary} />;
    case 'streak_reminder':
      return <Ionicons name="flame" size={20} color="#FF9500" />;
    default:
      return <Ionicons name="notifications" size={20} color={Colors.primary} />;
  }
};
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = NotificationService.subscribeNotifications(
      user.uid,
      (items) => {
        setNotifications(items);
        setIsLoading(false);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

    // 2. Xử lý khi nhấn vào thông báo: Đánh dấu đã đọc & Điều hướng
  const handlePressItem = useCallback(
    (item: NotificationItem) => {
      if (!user?.uid) return;
      // Đánh dấu đã đọc nếu chưa đọc
      if (!item.isRead) {
        NotificationService.markAsRead(user.uid, item.id);
      }
      // Điều hướng tương ứng
      switch (item.type) {
        case 'friend_request':
        case 'friend_accepted':
          navigation.navigate('SearchBuddies');
          break;
        case 'streak_reminder':
          navigation.navigate('Conquest');
          break;
        default:
          break;
      }
    },
   [user?.uid, navigation]
  );
   const renderItem = ({ item }: { item: NotificationItem }) => (
    <Pressable
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handlePressItem(item)}
    >
      {item.senderAvatar ? (
        <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholderAvatar]}>
          <Ionicons name="person" size={22} color={Colors.textMuted} />
        </View>
      )}
      <View style={styles.contentContainer}>
        <Text style={styles.textContent}>
          {item.senderName && <Text style={styles.username}>{item.senderName} </Text>}
          {item.body || item.title}
        </Text>
        <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
      <View style={styles.iconContainer}>
        {renderNotificationIcon(item.type)}
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.notifications.headerTitle}</Text>
        <View style={styles.spacer} />
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5].map((key) => (
            <NotificationSkeleton key={key} />
          ))}
        </View>
      ) : notifications.length ===0 ?( <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyText}>{t.notifications.emptyText}</Text>
        </View>): (
           <FlashList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  spacer: {
    width: 36,
  },
   unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  listContent: {
    paddingBottom: 40,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
    iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  unreadItem: {
    backgroundColor: 'rgba(112, 194, 180, 0.05)', // slight primary tint
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
    placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 15,
    marginTop: 12,
  },
  username: {
    fontWeight: '600',
    color: Colors.white,
  },
  time: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
