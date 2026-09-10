import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';

interface ProfileStatsProps {
  footprintsCount?: number;
  snapsCount?: number;
  buddiesCount?: number;
}

// Hàm format số lượng hiển thị (ví dụ 1200 -> 1.2k)
const formatStatNumber = (num: number = 0): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return num.toString();
};

export const ProfileStats = ({
  footprintsCount = 0,
  snapsCount = 0,
  buddiesCount = 0,
}: ProfileStatsProps): React.JSX.Element => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{formatStatNumber(footprintsCount)}</Text>
        <Text style={styles.statLabel}>FOOTPRINTS</Text>
      </View>
      
      {/* Đường phân cách */}
      <View style={styles.statDivider} />
      
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{formatStatNumber(snapsCount)}</Text>
        <Text style={styles.statLabel}>SNAPS</Text>
      </View>
      
      {/* Đường phân cách */}
      <View style={styles.statDivider} />
      
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{formatStatNumber(buddiesCount)}</Text>
        <Text style={styles.statLabel}>BUDDIES</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});
