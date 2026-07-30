import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { NotificationSkeleton } from '../components/NotificationSkeleton';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'follow';
  user: string;
  avatar: string;
  content: string;
  time: string;
  isRead: boolean;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'like',
    user: 'Alex_W',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250',
    content: 'liked your photo from Ha Giang.',
    time: '5m ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'comment',
    user: 'Linh_Nguyen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250',
    content: 'commented: "Wow! Beautiful place!"',
    time: '2h ago',
    isRead: true,
  },
  {
    id: '3',
    type: 'follow',
    user: 'Travel Crew 🏔️',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=250',
    content: 'started following you.',
    time: 'Yesterday',
    isRead: true,
  },
];

export const NotificationsScreen = ({ navigation }: Props): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <Pressable style={[styles.notificationItem, !item.isRead && styles.unreadItem]}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.contentContainer}>
        <Text style={styles.textContent}>
          <Text style={styles.username}>{item.user} </Text>
          {item.content}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {item.type === 'like' && <Ionicons name="heart" size={20} color={Colors.error} />}
      {item.type === 'comment' && <Ionicons name="chatbubble" size={20} color={Colors.primary} />}
      {item.type === 'follow' && <Ionicons name="person-add" size={20} color={Colors.primary} />}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.spacer} />
      </View>

      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5].map((key) => (
            <NotificationSkeleton key={key} />
          ))}
        </View>
      ) : (
        <FlatList
          data={MOCK_NOTIFICATIONS}
          keyExtractor={item => item.id}
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
  textContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
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
