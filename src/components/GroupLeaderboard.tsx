import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../constants/Colors';

// Interface dữ liệu mỗi người chơi trong bảng xếp hạng
interface LeaderboardPlayer {
  rank: number;
  username: string;
  score: number;
  emoji: string;
  avatarColor: string;
  badge?: string;
  isCurrentUser?: boolean;
  globalRank?: string;
}

interface GroupLeaderboardProps {
  players: LeaderboardPlayer[];
}

/**
 * Component bảng xếp hạng nhóm — hiển thị danh sách người chơi có điểm cao nhất
 * Người dùng hiện tại được highlight bằng viền xanh Mint
 */
export const GroupLeaderboard = ({ players }: GroupLeaderboardProps): React.JSX.Element => {
  return (
    <View style={styles.leaderboardCard}>
      <Text style={styles.leaderboardTitle}>Group Leaderboard</Text>

      <View style={styles.leaderboardList}>
        {players.map((player) => (
          <View
            key={player.username}
            style={[
              styles.leaderboardItem,
              // Highlight nếu là người dùng hiện tại
              player.isCurrentUser && styles.currentUserItem,
            ]}
          >
            {/* Thông tin người chơi: thứ hạng + avatar + tên */}
            <View style={styles.playerInfo}>
              <Text
                style={[
                  styles.rankText,
                  player.isCurrentUser && { color: Colors.primary },
                ]}
              >
                {player.rank}.
              </Text>
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: player.avatarColor },
                  // Avatar người dùng hiện tại có viền xanh Mint
                  player.isCurrentUser && styles.currentUserAvatar,
                ]}
              >
                <Text style={styles.avatarEmoji}>{player.emoji}</Text>
              </View>
              <Text
                style={[
                  styles.playerName,
                  player.isCurrentUser && { fontWeight: '700' },
                ]}
              >
                {player.username}
                {/* Hiển thị thứ hạng toàn cầu nếu có */}
                {player.globalRank && (
                  <Text style={styles.playerRankSub}> ({player.globalRank})</Text>
                )}
              </Text>
            </View>

            {/* Điểm số + huy hiệu */}
            <View style={styles.scoreContainer}>
              <Text
                style={[
                  styles.scoreText,
                  player.isCurrentUser && { color: Colors.primary, fontWeight: '700' },
                ]}
              >
                {player.score} pts
              </Text>
              {player.badge ? (
                <Text style={styles.badgeEmoji}>{player.badge}</Text>
              ) : (
                // Giữ chỗ để căn chỉnh khi không có huy hiệu
                <View style={styles.badgeEmojiPlaceholder} />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  leaderboardCard: {
    backgroundColor: '#1C1D21',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  leaderboardTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  leaderboardList: {
    gap: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
    width: 16,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  playerName: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  playerRankSub: {
    color: '#6B7280',
    fontWeight: '400',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreText: {
    color: Colors.text,
    fontSize: 15,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  badgeEmojiPlaceholder: {
    width: 22,
  },
  // Highlight cho người dùng hiện tại
  currentUserItem: {
    backgroundColor: 'rgba(112, 194, 180, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(112, 194, 180, 0.3)',
  },
  currentUserAvatar: {
    backgroundColor: '#BBDEFB',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});
