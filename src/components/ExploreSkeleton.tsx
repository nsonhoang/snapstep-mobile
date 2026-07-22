import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

interface ExploreSkeletonProps {
  viewMode: 'grid' | 'feed';
}

export const ExploreSkeleton = ({ viewMode }: ExploreSkeletonProps): React.JSX.Element => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 700 }),
        withTiming(0.3, { duration: 700 })
      ),
      -1, // infinite loop
      true // reverse on loop back
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (viewMode === 'feed') {
    // 1-Column Full HD Feed Skeleton
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((key) => (
          <Animated.View
            key={key}
            style={[styles.feedSkeletonCard, animatedStyle]}
          />
        ))}
      </View>
    );
  }

  // 2-Column Grid Skeleton
  return (
    <View style={styles.container}>
      <View style={styles.gridRow}>
        <View style={styles.gridColumn}>
          {[1, 2, 3].map((key) => (
            <Animated.View
              key={key}
              style={[styles.gridSkeletonCard, animatedStyle]}
            />
          ))}
        </View>
        <View style={styles.gridColumn}>
          {[4, 5, 6].map((key) => (
            <Animated.View
              key={key}
              style={[styles.gridSkeletonCard, animatedStyle]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridColumn: {
    flex: 1,
  },
  gridSkeletonCard: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    marginBottom: 12,
  },
  feedSkeletonCard: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },
});
