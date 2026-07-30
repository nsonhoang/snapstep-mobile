import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';

interface BuddySkeletonProps {
  hasTwoButtons?: boolean;
}

export const BuddySkeleton = ({ hasTwoButtons = false }: BuddySkeletonProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <Skeleton style={styles.avatar} />
      <View style={styles.info}>
        <Skeleton style={styles.nameLine} />
        <Skeleton style={styles.mutualLine} />
      </View>
      <View style={styles.buttonContainer}>
        <Skeleton style={styles.button} />
        {hasTwoButtons && <Skeleton style={styles.button} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    gap: 6,
    justifyContent: 'center',
  },
  nameLine: {
    height: 16,
    width: '60%',
    borderRadius: 4,
  },
  mutualLine: {
    height: 12,
    width: '40%',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  button: {
    width: 70,
    height: 36,
    borderRadius: 18,
  },
});
