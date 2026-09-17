import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

// Đường cong Easing chuẩn từ expo-animation
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=300';

// Interface định nghĩa cấu trúc dữ liệu của 1 chuyến đi
export interface SavedTripInfo {
  id: string;
  title: string;
  location: string;
  image?: string;
}

interface SavedTripCardProps {
  trip: SavedTripInfo;
  onPress?: (tripId: string) => void;
}

export const SavedTripCard = ({
  trip,
  onPress,
}: SavedTripCardProps): React.JSX.Element => {
  // Shared value cho vi hiệu ứng nhấn vật lý (UI thread)
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePressIn = () => {
    scale.set(withTiming(0.98, { duration: 120, easing: EASE_OUT }));
  };

  const handlePressOut = () => {
    scale.set(withTiming(1, { duration: 120, easing: EASE_OUT }));
  };

  const imageUrl = trip.image && trip.image.trim() !== '' ? trip.image : DEFAULT_COVER;

  return (
    <Pressable
      onPress={() => onPress?.(trip.id)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={8}
      pressRetentionOffset={12}
    >
      <Animated.View style={[styles.routeCard, animatedStyle]}>
        <Image
          source={imageUrl}
          style={styles.routeImage}
          contentFit="cover"
          transition={250}
        />
        <View style={styles.routeInfo}>
          <Text style={styles.routeTitle} numberOfLines={2} ellipsizeMode="tail">
            {trip.title}
          </Text>
          <View style={styles.routeLocationRow}>
            <MaterialIcons name="location-on" size={13} color={Colors.primary} />
            <Text style={styles.routeLocation} numberOfLines={1} ellipsizeMode="tail">
              {trip.location}
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    gap: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  routeImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  routeInfo: {
    flex: 1,
    gap: 6,
  },
  routeTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  routeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeLocation: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
