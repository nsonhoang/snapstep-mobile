import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  RefreshControl,
  Share,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';
import { RootStackParamList, SavedTripScreenProps } from '../navigation/types';
import { CreateTripModal, TripData } from '../components/CreateTripModal';
import { PressableScale } from '../components/PressableScale';
import { Skeleton } from '../components/Skeleton';
import { TripService, TripWithId } from '../services/tripService';
import { PostService, PostWithId } from '../services/postService';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800';

export const SavedTripScreen = ({
  route,
}: SavedTripScreenProps): React.JSX.Element => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tripId } = route?.params || { tripId: '' };
  const insets = useSafeAreaInsets();

  const [trip, setTrip] = useState<TripWithId | null>(null);
  const [snaps, setSnaps] = useState<PostWithId[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);

  // Reanimated 4 Shared Value cho tọa độ cuộn (chạy 100% trên UI thread)
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.set(event.contentOffset.y);
    },
  });

  // Tải dữ liệu thật từ Firestore
  const fetchTripDetails = useCallback(async () => {
    if (!tripId) {
      setIsLoading(false);
      return;
    }

    try {
      const tripData = await TripService.getTripById(tripId);
      setTrip(tripData);

      if (tripData && tripData.postIds && tripData.postIds.length > 0) {
        // Tải song song danh sách bài viết từ postIds của chuyến đi
        const postsPromises = tripData.postIds.map((id) =>
          PostService.getPostById(id),
        );
        const postsResults = await Promise.all(postsPromises);
        const validPosts = postsResults.filter(
          (p): p is PostWithId => p !== null,
        );
        setSnaps(validPosts);
      } else {
        setSnaps([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết chuyến đi:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchTripDetails();
  }, [fetchTripDetails]);

  // Chia sẻ hành trình
  const handleShare = async () => {
    if (!trip) return;
    try {
      await Share.share({
        title: trip.title,
        message: `Khám phá hành trình "${trip.title}" trên SnapStep! ${trip.description || ''}`,
      });
    } catch (error) {
      console.error('Lỗi khi chia sẻ hành trình:', error);
    }
  };

  // Chuẩn bị dữ liệu cho modal chỉnh sửa
  const editModalData: TripData | undefined = useMemo(() => {
    if (!trip) return undefined;
    return {
      id: trip.id,
      title: trip.title,
      location: trip.description || '',
      description: trip.description || '',
      coverImage: trip.coverImageUrl,
      schedules: (trip.details || []).map((detail, index) => ({
        id: index.toString(),
        dateTime: '',
        description: detail.describe,
      })),
    };
  }, [trip]);

  // Hiệu ứng Parallax Zoom & Translate cho ảnh bìa (UI thread)
  const coverImageAnimatedStyle = useAnimatedStyle(() => {
    const y = scrollY.get();
    const scale = interpolate(y, [-150, 0], [1.35, 1], Extrapolation.CLAMP);
    const translateY = interpolate(
      y,
      [-150, 0, 300],
      [-75, 0, 100],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Hiệu ứng chuyển nền Navigation Bar khi cuộn qua ảnh bìa (UI thread)
  const headerBackgroundAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.get(),
      [120, 200],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  // Hiệu ứng hiện tiêu đề trên Top Bar khi cuộn (UI thread)
  const headerTitleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.get(),
      [150, 220],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.get(),
      [150, 220],
      [10, 0],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Kích thước ảnh trong lưới 3 cột
  const imageGap = 2;
  const imageSize = (Value.widthScreen - imageGap * 2) / 3;

  return (
    <View style={styles.container}>
      {/* Floating Top Navigation Bar */}
      <View
        style={[
          styles.headerContainer,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
      >
        {/* Nền làm mờ tối dần khi cuộn */}
        <Animated.View
          style={[styles.headerBackground, headerBackgroundAnimatedStyle]}
        />

        <View style={styles.headerContent}>
          <PressableScale onPress={() => navigation.goBack()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.white} />
          </PressableScale>

          {/* Tiêu đề thanh điều hướng cuộn lên */}
          <Animated.View style={[styles.headerTitleWrapper, headerTitleAnimatedStyle]}>
            <Text style={styles.headerTitleText} numberOfLines={1}>
              {trip?.title || 'Hành trình'}
            </Text>
          </Animated.View>

          <View style={styles.headerActions}>
            <PressableScale
              style={styles.iconButton}
              onPress={() => setEditModalVisible(true)}
            >
              <MaterialIcons name="edit" size={22} color={Colors.white} />
            </PressableScale>
            <PressableScale style={styles.iconButton} onPress={handleShare}>
              <MaterialIcons name="share" size={22} color={Colors.white} />
            </PressableScale>
          </View>
        </View>
      </View>

      {/* Nội dung cuộn chính */}
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Ảnh bìa hành trình có Parallax */}
        <View style={styles.coverWrapper}>
          {isLoading ? (
            <Skeleton style={styles.coverImage} />
          ) : (
            <Animated.View style={[styles.coverImage, coverImageAnimatedStyle]}>
              <Image
                source={trip?.coverImageUrl || DEFAULT_COVER}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={300}
              />
            </Animated.View>
          )}
        </View>

        {/* Khối thông tin chi tiết đè lên ảnh bìa */}
        <View style={styles.infoContainer}>
          {isLoading ? (
            <>
              <Skeleton
                style={{
                  height: 32,
                  width: '80%',
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              />
              <Skeleton
                style={{
                  height: 20,
                  width: '45%',
                  borderRadius: 4,
                  marginBottom: 20,
                }}
              />
              <Skeleton
                style={{
                  height: 16,
                  width: '100%',
                  borderRadius: 4,
                  marginBottom: 6,
                }}
              />
              <Skeleton
                style={{
                  height: 16,
                  width: '85%',
                  borderRadius: 4,
                  marginBottom: 24,
                }}
              />
              <Skeleton
                style={{
                  height: 24,
                  width: '50%',
                  borderRadius: 6,
                  marginBottom: 16,
                }}
              />
              {[1, 2].map((key) => (
                <View
                  key={key}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <Skeleton
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      marginTop: 4,
                    }}
                  />
                  <View style={{ flex: 1, gap: 8 }}>
                    <Skeleton
                      style={{ height: 20, width: '35%', borderRadius: 4 }}
                    />
                    <Skeleton
                      style={{ height: 36, width: '100%', borderRadius: 8 }}
                    />
                  </View>
                </View>
              ))}
            </>
          ) : trip ? (
            <>
              <Text style={styles.title}>{trip.title}</Text>
              <View style={styles.locationRow}>
                <MaterialIcons
                  name="location-on"
                  size={16}
                  color={Colors.primary}
                />
                <Text style={styles.location}>
                  {trip.description || 'Việt Nam'}
                </Text>
              </View>

              {trip.description ? (
                <Text style={styles.description}>{trip.description}</Text>
              ) : null}

              {/* Lịch trình (Timeline) */}
              <Text style={styles.sectionTitle}>Lịch trình chi tiết</Text>
              {trip.details && trip.details.length > 0 ? (
                <View style={styles.timeline}>
                  {trip.details.map((detail, index) => (
                    <View key={index} style={styles.dayContainer}>
                      {/* Đường kẻ dọc */}
                      <View style={styles.timelineLine} />
                      {/* Chấm tròn mốc thời gian */}
                      <View style={styles.timelineDot} />

                      <View style={styles.dayContent}>
                        <Text style={styles.dayLabel}>
                          Trạm dừng {index + 1}
                        </Text>
                        <View style={styles.stopRow}>
                          <MaterialIcons
                            name="directions-walk"
                            size={16}
                            color={Colors.primary}
                          />
                          <Text style={styles.stopText}>{detail.describe}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyTimelineContainer}>
                  <Text style={styles.emptyTimelineText}>
                    Chưa có trạm dừng nào được ghi lại.
                  </Text>
                </View>
              )}

              {/* Tiêu đề phần Hình ảnh */}
              <Text style={[styles.sectionTitle, { marginTop: 16, marginBottom: 12 }]}>
                Ảnh check-in ({snaps.length})
              </Text>
            </>
          ) : (
            <View style={styles.notFoundContainer}>
              <MaterialIcons
                name="error-outline"
                size={48}
                color={Colors.textMuted}
              />
              <Text style={styles.notFoundText}>
                Không tìm thấy chuyến đi hoặc chuyến đi đã bị xóa.
              </Text>
            </View>
          )}
        </View>

        {/* Lưới ảnh check-in 3 cột */}
        {isLoading ? (
          <View style={styles.gridContainer}>
            {['1', '2', '3', '4', '5', '6'].map((key, index) => (
              <Skeleton
                key={key}
                style={{
                  width: imageSize,
                  height: imageSize,
                  marginRight: (index + 1) % 3 !== 0 ? imageGap : 0,
                  marginBottom: imageGap,
                }}
              />
            ))}
          </View>
        ) : snaps.length > 0 ? (
          <View style={styles.gridContainer}>
            {snaps.map((item, index) => (
              <PressableScale
                key={item.id}
                style={{
                  width: imageSize,
                  height: imageSize,
                  marginRight: (index + 1) % 3 !== 0 ? imageGap : 0,
                  marginBottom: imageGap,
                }}
                onPress={() =>
                  navigation.navigate('PostDetail', {
                    post: item,
                    posts: snaps,
                  })
                }
              >
                <Image
                  source={item.imageUrl}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={250}
                />
              </PressableScale>
            ))}
          </View>
        ) : (
          !isLoading &&
          trip && (
            <View style={styles.emptySnapsContainer}>
              <MaterialIcons
                name="photo-camera"
                size={40}
                color={Colors.textMuted}
              />
              <Text style={styles.emptySnapsText}>
                Chưa có ảnh check-in nào trong chuyến đi này.
              </Text>
            </View>
          )
        )}
      </Animated.ScrollView>

      {/* Modal Chỉnh sửa chuyến đi */}
      <CreateTripModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        initialData={editModalData}
        onSuccess={() => fetchTripDetails()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitleWrapper: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  headerTitleText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  coverWrapper: {
    width: Value.widthScreen,
    height: 350,
    overflow: 'hidden',
  },
  coverImage: {
    width: Value.widthScreen,
    height: 350,
  },
  infoContainer: {
    padding: 24,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  title: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  location: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  dayContainer: {
    position: 'relative',
    paddingLeft: 24,
    paddingBottom: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 4,
    top: 6,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  timelineDot: {
    position: 'absolute',
    left: -1,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  dayContent: {
    gap: 8,
  },
  dayLabel: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  stopText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  emptyTimelineContainer: {
    paddingVertical: 12,
  },
  emptyTimelineText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptySnapsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptySnapsText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  notFoundContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  notFoundText: {
    color: Colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
});
