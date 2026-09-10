import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { UserWithId } from '../services/userService';
import { FriendshipStatus } from '../services/friendshipService';

interface BuddySearchItemProps {
  user: UserWithId;
  relationshipStatus?: FriendshipStatus;
  isCurrentUser?: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onAccept: () => void;
}

export const BuddySearchItem = ({
  user,
  relationshipStatus,
  isCurrentUser,
  onAdd,
  onCancel,
  onAccept,
}: BuddySearchItemProps): React.JSX.Element => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Người dùng SnapStep';
  const defaultAvatar =
    user.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250';

  // Hiển thị nút bấm tương ứng theo trạng thái kết bạn
  const renderActionButton = () => {
    // Nếu là chính bản thân mình thì hiển thị nhãn nhận diện, tuyệt đối không hiển thị nút kết bạn
    if (isCurrentUser) {
      return (
        <View style={styles.selfBadge}>
          <Text style={styles.selfBadgeText}>Bạn</Text>
        </View>
      );
    }

    switch (relationshipStatus) {
      case 'accepted':
        return (
          <View style={styles.friendsBadge}>
            <Ionicons name="checkmark" size={14} color={Colors.primary} />
            <Text style={styles.friendsBadgeText}>Bạn bè</Text>
          </View>
        );

      case 'outgoing_pending':
        return (
          <Pressable
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={onCancel}
          >
            <Text style={styles.cancelBtnText}>Hủy lời mời</Text>
          </Pressable>
        );

      case 'incoming_pending':
        return (
          <Pressable
            style={({ pressed }) => [
              styles.acceptBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={onAccept}
          >
            <Text style={styles.acceptBtnText}>Đồng ý</Text>
          </Pressable>
        );

      default:
        return (
          <Pressable
            style={({ pressed }) => [
              styles.addBtn,
              pressed && styles.btnPressed,
            ]}
            onPress={onAdd}
          >
            <Ionicons name="person-add" size={14} color={Colors.black} />
            <Text style={styles.addBtnText}>Kết bạn</Text>
          </Pressable>
        );
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: defaultAvatar }}
        style={styles.avatar}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {fullName}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>
      </View>
      <View style={styles.actionContainer}>{renderActionButton()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceBright,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  email: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  addBtnText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: Colors.surfaceBright,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  acceptBtnText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: '600',
  },
  friendsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(112, 194, 180, 0.12)',
  },
  friendsBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  selfBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selfBadgeText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
