import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';
import { RootStackParamList } from '../navigation/types';
import { SavedTripCard, SavedTripInfo } from './SavedTripCard';
import { PostService, PostWithId } from '../services/postService';
import { TripService, TripWithId } from '../services/tripService';
import { useAuthStore } from '../stores/authStore';

interface ProfileTabsProps {
  userId?: string;
  onSnapsCountChange?: (count: number) => void;
  onTripsCountChange?: (count: number) => void;
}

export const ProfileTabs = ({
  userId,
  onSnapsCountChange,
  onTripsCountChange,
}: ProfileTabsProps): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<'snaps' | 'routes'>('snaps');
  const [snaps, setSnaps] = useState<PostWithId[]>([]);
  const [trips, setTrips] = useState<TripWithId[]>([]);
  const [isLoadingSnaps, setIsLoadingSnaps] = useState<boolean>(true);
  const [isLoadingTrips, setIsLoadingTrips] = useState<boolean>(true);

  const authUser = useAuthStore((state) => state.user);
  const targetUid = userId || authUser?.uid;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Lắng nghe realtime các bài viết của user đang đăng nhập
  useEffect(() => {
    if (!targetUid) {
      setIsLoadingSnaps(false);
      return;
    }

    setIsLoadingSnaps(true);
    const unsubscribe = PostService.subscribeToPosts(12, targetUid, (posts) => {
      setSnaps(posts);
      setIsLoadingSnaps(false);
      onSnapsCountChange?.(posts.length);
    });

    return () => {
      unsubscribe();
    };
  }, [targetUid, onSnapsCountChange]);

  // Tải các chuyến đi của user
  useEffect(() => {
    if (!targetUid) {
      setIsLoadingTrips(false);
      return;
    }

    let isMounted = true;
    const fetchTrips = async () => {
      setIsLoadingTrips(true);
      try {
        const res = await TripService.getTrips(6, targetUid);
        if (isMounted) {
          setTrips(res.trips);
          setIsLoadingTrips(false);
          onTripsCountChange?.(res.trips.length);
        }
      } catch (error) {
        console.error('Lỗi khi tải chuyến đi:', error);
        if (isMounted) setIsLoadingTrips(false);
      }
    };

    fetchTrips();

    return () => {
      isMounted = false;
    };
  }, [targetUid, onTripsCountChange]);

  return (
    <View style={styles.container}>
      {/* Các tab chuyển đổi */}
      <View style={styles.tabsHeader}>
        <Pressable style={styles.tab} onPress={() => setActiveTab('snaps')}>
          <Text style={[styles.tabText, activeTab === 'snaps' && styles.activeTabText]}>
            My Snaps {snaps.length > 0 ? `(${snaps.length})` : ''}
          </Text>
          {activeTab === 'snaps' && <View style={styles.activeIndicator} />}
        </Pressable>
        
        <Pressable style={styles.tab} onPress={() => setActiveTab('routes')}>
          <Text style={[styles.tabText, activeTab === 'routes' && styles.activeTabText]}>
            Saved Routes {trips.length > 0 ? `(${trips.length})` : ''}
          </Text>
          {activeTab === 'routes' && <View style={styles.activeIndicator} />}
        </Pressable>
      </View>

      {/* Nội dung tab My Snaps */}
      {activeTab === 'snaps' ? (
        isLoadingSnaps ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : snaps.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="photo-camera" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có ảnh nào</Text>
            <Text style={styles.emptySubtitle}>
              Hãy chụp và lưu lại khoảnh khắc đầu tiên trên hành trình của bạn!
            </Text>
          </View>
        ) : (
          <View style={styles.snapsGrid}>
            {snaps.map((snap) => (
              <Pressable
                key={snap.id}
                style={styles.snapImageContainer}
                onPress={() =>
                  navigation.navigate('PostDetail', {
                    post: snap,
                    posts: snaps,
                  })
                }
              >
                <Image
                  source={snap.imageUrl}
                  style={styles.snapImage}
                  contentFit="cover"
                  transition={300}
                />
              </Pressable>
            ))}
            {snaps.length >= 12 && (
              <View style={styles.snapImageContainer}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('MainTabs', { screen: 'Explore' })
                  }
                  style={styles.moreSnapsBtn}
                >
                  <Text style={styles.text}>Xem thêm...</Text>
                </Pressable>
              </View>
            )}
          </View>
        )
      ) : (
        /* Nội dung tab Saved Routes */
        isLoadingTrips ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="map" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có chuyến đi nào</Text>
            <Text style={styles.emptySubtitle}>
              Tạo lộ trình và bắt đầu khám phá các vùng đất mới cùng SnapStep!
            </Text>
          </View>
        ) : (
          <View style={styles.routesList}>
            {trips.map((trip) => {
              const routeInfo: SavedTripInfo = {
                id: trip.id,
                title: trip.title || 'Chuyến đi chưa đặt tên',
                location: trip.description || 'Việt Nam',
                image:
                  trip.coverImageUrl ||
                  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=300',
              };
              return (
                <SavedTripCard 
                  key={trip.id} 
                  trip={routeInfo} 
                  onPress={(tripId) => navigation.navigate('SavedTrip', { tripId })} 
                />
              );
            })}
            <View style={styles.routeCard}>
              <Pressable
                onPress={() => navigation.navigate('AllSavedTrips')}
                style={styles.moreRouteBtn}
              >
                <Text style={styles.text}>Xem thêm...</Text>
              </Pressable>
            </View>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: Colors.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 2,
    backgroundColor: Colors.primary,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  snapsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingHorizontal: 2,
  },
  snapImageContainer: {
    width: (Value.widthScreen - 8) / 3,
    aspectRatio: 4 / 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  snapImage: {
    width: '100%',
    height: '100%',
  },
  moreSnapsBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  routesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    marginBottom: 12,
  },
  moreRouteBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
