import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';

export const NotificationSkeleton = (): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <Skeleton style={styles.avatar} />
      <View style={styles.content}>
        <Skeleton style={styles.textLine1} />
        <Skeleton style={styles.textLine2} />
      </View>
      <Skeleton style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    gap: 8,
    justifyContent: 'center',
  },
  textLine1: {
    height: 14,
    width: '80%',
    borderRadius: 4,
  },
  textLine2: {
    height: 12,
    width: '30%',
    borderRadius: 4,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
