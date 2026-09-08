import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SearchBar } from '../components/SearchBar';
import { ChatItem, Chat } from '../components/ChatItem';
import { ChatSkeleton } from '../components/ChatSkeleton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../stores/authStore';
import { useFriendshipStore } from '../stores/friendshipStore';

export const FriendsScreen = (): React.JSX.Element => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  const currentUserId = user?.uid || '';

  const {
    friends,
    incomingRequests,
    isLoading,
    subscribeFriends,
  } = useFriendshipStore();

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lắng nghe cập nhật danh sách bạn bè thời gian thực
  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = subscribeFriends(currentUserId);
    return () => unsubscribe();
  }, [currentUserId]);

  // Chuyển đổi danh sách bạn bè thật sang format ChatItem để hiển thị
  const chatsList: Chat[] = useMemo(() => {
    return friends.map((friend) => ({
      id: friend.id,
      name: `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || friend.email || 'Bạn bè',
      lastMessage: 'Đã kết nối bạn đồng hành!',
      time: 'Vừa xong',
      unread: 0,
      avatar:
        friend.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
      isOnline: true,
    }));
  }, [friends]);

  // Lọc theo từ khóa tìm kiếm
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chatsList;
    return chatsList.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, chatsList]);

  const renderChatItem = useCallback(({ item }: { item: Chat }) => {
    return <ChatItem item={item} />;
  }, []);

  const navigateToNewFriends = () => {
    navigation.navigate('SearchBuddies');
  };

  const navigateToNotification = () => {
    navigation.navigate('Notifications');
  };

  const hasIncomingRequests = incomingRequests.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.iconContainer}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={navigateToNotification}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={navigateToNewFriends}
          >
            <Ionicons name="person-add-outline" size={24} color={Colors.primary} />
            {hasIncomingRequests && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{incomingRequests.length}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm kiếm bạn bè..."
        />
      </View>

      {/* Danh sách bạn bè */}
      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3, 4].map((key) => (
            <ChatSkeleton key={key} />
          ))}
        </View>
      ) : filteredChats.length > 0 ? (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={Colors.outline} />
          <Text style={styles.emptyTitle}>
            {searchQuery.trim()
              ? `Không tìm thấy bạn bè "${searchQuery}"`
              : 'Chưa có bạn bè nào'}
          </Text>
          <Text style={styles.emptySubtitle}>
            Hãy tìm kiếm và kết bạn với những người đồng hành trên SnapStep!
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.findBuddiesBtn,
              pressed && styles.pressed,
            ]}
            onPress={navigateToNewFriends}
          >
            <Ionicons name="person-add" size={16} color={Colors.black} />
            <Text style={styles.findBuddiesBtnText}>Tìm Bạn Bè Ngay</Text>
          </Pressable>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  badgeText: {
    color: Colors.black,
    fontSize: 10,
    fontWeight: '800',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  listContent: {
    paddingBottom: 100, // Để khoảng trống cho Bottom Tab
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 80,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  findBuddiesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 24,
  },
  findBuddiesBtnText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
