import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Colors } from '../constants/Colors';
import { AllSavedTripsScreenProps } from '../navigation/types';
import { SavedTripCard, SavedTripInfo } from '../components/SavedTripCard';
import { CreateTripModal } from '../components/CreateTripModal';
import { Skeleton } from '../components/Skeleton';
import { PressableScale } from '../components/PressableScale';
import { useTripStore } from '../stores/tripStore';
import { useAuthStore } from '../stores/authStore';
import { TripWithId } from '../services/tripService';

export const AllSavedTripsScreen = ({
  navigation,
}: AllSavedTripsScreenProps): React.JSX.Element => {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const authUser = useAuthStore((state) => state.user);
  const {
    trips,
    isLoading,
    isFetchingMore,
    hasMore,
    fetchTrips,
    fetchMoreTrips,
  } = useTripStore();

  // Tải danh sách hành trình của người dùng
  useEffect(() => {
    fetchTrips(authUser?.uid);
  }, [authUser?.uid, fetchTrips]);

  // Kéo để làm mới danh sách (Pull-to-refresh)
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchTrips(authUser?.uid);
    setIsRefreshing(false);
  }, [authUser?.uid, fetchTrips]);

  // Tải thêm khi cuộn tới đáy danh sách
  const handleEndReached = useCallback(() => {
    if (hasMore && !isFetchingMore && !isLoading) {
      fetchMoreTrips(authUser?.uid);
    }
  }, [hasMore, isFetchingMore, isLoading, fetchMoreTrips, authUser?.uid]);

  // Xử lý khi nhấn vào 1 hành trình để xem chi tiết
  const handlePressTrip = useCallback(
    (tripId: string) => {
      navigation.navigate('SavedTrip', { tripId });
    },
    [navigation],
  );

  // Render từng item chuyến đi
  const renderItem = useCallback(
    ({ item }: { item: TripWithId }) => {
      const tripInfo: SavedTripInfo = {
        id: item.id,
        title: item.title,
        location: item.description || 'Việt Nam',
        image: item.coverImageUrl,
      };
      return <SavedTripCard trip={tripInfo} onPress={handlePressTrip} />;
    },
    [handlePressTrip],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header cố định */}
      <View style={styles.header}>
        <PressableScale
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
        </PressableScale>
        <Text style={styles.headerTitle}>Hành trình đã lưu</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Danh sách hành trình dùng Shopify FlashList */}
      {isLoading && trips.length === 0 ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((key) => (
            <View key={key} style={styles.skeletonCard}>
              <Skeleton style={{ width: 64, height: 64, borderRadius: 12 }} />
              <View style={{ flex: 1, gap: 8 }}>
                <Skeleton style={{ height: 18, width: '75%', borderRadius: 6 }} />
                <Skeleton style={{ height: 14, width: '45%', borderRadius: 4 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlashList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="map" size={54} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Chưa có hành trình nào</Text>
              <Text style={styles.emptySubtitle}>
                Tạo chuyến đi mới và bắt đầu ghi lại những khoảnh khắc đáng nhớ!
              </Text>
            </View>
          }
          ListFooterComponent={
            isFetchingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : (
              <View style={{ height: 90 }} />
            )
          }
        />
      )}

      {/* Nút Tạo chuyến đi mới nổi ở đáy màn hình */}
      <View
        style={[
          styles.bottomButtonContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <PressableScale
          style={styles.newTripButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.newTripButtonText}>Chuyến đi mới</Text>
          <FontAwesome5 name="walking" size={20} color={Colors.background} />
        </PressableScale>
      </View>

      {/* Modal tạo chuyến đi mới */}
      <CreateTripModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => fetchTrips(authUser?.uid)}
      />
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  skeletonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  newTripButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  newTripButtonText: {
    fontSize: 16,
    color: Colors.background,
    fontWeight: '700',
  },
});
