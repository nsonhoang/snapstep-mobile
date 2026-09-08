import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SearchBar } from '../components/SearchBar';
import { BuddySkeleton } from '../components/BuddySkeleton';
import { BuddySearchItem } from '../components/BuddySearchItem';
import { InvitedBuddyItem } from '../components/InvitedBuddyItem';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../stores/authStore';
import { useFriendshipStore } from '../stores/friendshipStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchBuddies'>;

export const SearchBuddiesScreen = ({ navigation }: Props): React.JSX.Element => {
  const { user } = useAuthStore();
  const currentUserId = user?.uid || '';

  const {
    relationships,
    incomingRequests,
    searchResults,
    isSearching,
    isLoading,
    searchUsers,
    clearSearch,
    sendRequest,
    cancelRequest,
    acceptRequest,
    rejectRequest,
    subscribeFriends,
  } = useFriendshipStore();

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lắng nghe cập nhật danh sách bạn bè & lời mời thời gian thực
  useEffect(() => {
    if (!currentUserId) return;
    const unsubscribe = subscribeFriends(currentUserId);
    return () => unsubscribe();
  }, [currentUserId]);

  // Xử lý tìm kiếm với cơ chế debounce 400ms
  useEffect(() => {
    if (!searchQuery.trim()) {
      clearSearch();
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(searchQuery, currentUserId);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUserId]);

  // Xử lý các thao tác kết bạn
  const handleAdd = useCallback(
    (targetUid: string) => {
      if (!currentUserId) return;
      sendRequest(currentUserId, targetUid);
    },
    [currentUserId, sendRequest]
  );

  const handleCancel = useCallback(
    (targetUid: string) => {
      if (!currentUserId) return;
      cancelRequest(currentUserId, targetUid);
    },
    [currentUserId, cancelRequest]
  );

  const handleAccept = useCallback(
    (targetUid: string) => {
      if (!currentUserId) return;
      acceptRequest(currentUserId, targetUid);
    },
    [currentUserId, acceptRequest]
  );

  const handleReject = useCallback(
    (targetUid: string) => {
      if (!currentUserId) return;
      rejectRequest(currentUserId, targetUid);
    },
    [currentUserId, rejectRequest]
  );

  const isQuerying = searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Thanh tiêu đề Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Tìm Bạn Đồng Hành</Text>
        <View style={styles.spacer} />
      </View>

      {/* Ô tìm kiếm */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Nhập email hoặc tên bạn bè..."
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mục 1: Danh sách lời mời nhận được (Invited) */}
        {!isQuerying && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lời Mời Kết Bạn</Text>
              {incomingRequests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{incomingRequests.length}</Text>
                </View>
              )}
            </View>

            {isLoading ? (
              <View>
                {[1, 2].map((k) => (
                  <BuddySkeleton key={`inv-skel-${k}`} hasTwoButtons />
                ))}
              </View>
            ) : incomingRequests.length > 0 ? (
              incomingRequests.map((item) => (
                <InvitedBuddyItem
                  key={item.id}
                  user={item}
                  onAccept={() => handleAccept(item.id)}
                  onDelete={() => handleReject(item.id)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>Chưa có lời mời kết bạn nào</Text>
            )}
          </View>
        )}

        {/* Mục 2: Kết quả tìm kiếm hoặc Gợi ý */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            {isQuerying ? 'Kết Quả Tìm Kiếm' : 'Gợi Ý Bạn Bè'}
          </Text>

          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
            </View>
          ) : isQuerying ? (
            searchResults.length > 0 ? (
              searchResults.map((item) => {
                const rel = relationships[item.id];
                return (
                  <BuddySearchItem
                    key={item.id}
                    user={item}
                    relationshipStatus={rel?.status}
                    onAdd={() => handleAdd(item.id)}
                    onCancel={() => handleCancel(item.id)}
                    onAccept={() => handleAccept(item.id)}
                  />
                );
              })
            ) : (
              <Text style={styles.emptyText}>
                Không tìm thấy người dùng phù hợp với "{searchQuery}"
              </Text>
            )
          ) : (
            <Text style={styles.emptyText}>
              Nhập email hoặc tên vào thanh tìm kiếm ở trên để kết nối
            </Text>
          )}
        </View>
      </ScrollView>
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
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  spacer: {
    width: 36,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    color: Colors.black,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.7,
  },
});
