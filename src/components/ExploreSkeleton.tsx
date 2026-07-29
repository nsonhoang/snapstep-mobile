import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';

interface ExploreSkeletonProps {
  viewMode: 'grid' | 'feed';
}

export const ExploreSkeleton = ({ viewMode }: ExploreSkeletonProps): React.JSX.Element => {
  if (viewMode === 'feed') {
    // 1-Column Full HD Feed Skeleton
    return (
      <View style={styles.container}>
        {[1, 2, 3].map((key) => (
          <Skeleton key={key} style={styles.feedSkeletonCard} />
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
            <Skeleton key={key} style={styles.gridSkeletonCard} />
          ))}
        </View>
        <View style={styles.gridColumn}>
          {[4, 5, 6].map((key) => (
            <Skeleton key={key} style={styles.gridSkeletonCard} />
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
    marginBottom: 12,
  },
  feedSkeletonCard: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    marginBottom: 16,
  },
});
