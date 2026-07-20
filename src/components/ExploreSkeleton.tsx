import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

interface ExploreSkeletonProps {
  viewMode: 'grid' | 'feed';
}

export const ExploreSkeleton = ({ viewMode }: ExploreSkeletonProps): React.JSX.Element => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  if (viewMode === 'feed') {
    // 1-Column Full HD Feed Skeleton
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((key) => (
          <Animated.View
            key={key}
            style={[styles.feedSkeletonCard, { opacity: pulseAnim }]}
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
              style={[styles.gridSkeletonCard, { opacity: pulseAnim }]}
            />
          ))}
        </View>
        <View style={styles.gridColumn}>
          {[4, 5, 6].map((key) => (
            <Animated.View
              key={key}
              style={[styles.gridSkeletonCard, { opacity: pulseAnim }]}
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
    backgroundColor: '#1E252B',
    marginBottom: 12,
  },
  feedSkeletonCard: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    backgroundColor: '#1E252B',
    marginBottom: 16,
  },
});
