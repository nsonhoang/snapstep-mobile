import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';

export const ChatSkeleton = (): React.JSX.Element => {
  return (
    <View style={styles.chatItem}>
      {/* Avatar Skeleton */}
      <Skeleton style={styles.avatar} />

      {/* Message Info Skeleton */}
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Skeleton style={styles.nameLine} />
          <Skeleton style={styles.timeLine} />
        </View>
        
        <View style={styles.chatFooter}>
          <Skeleton style={styles.messageLine} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameLine: {
    height: 16,
    width: '40%',
    borderRadius: 4,
  },
  timeLine: {
    height: 12,
    width: '15%',
    borderRadius: 4,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageLine: {
    height: 14,
    width: '70%',
    borderRadius: 4,
  },
});
