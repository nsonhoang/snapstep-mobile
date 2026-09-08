import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '../constants/Colors';
import { UserWithId } from '../services/userService';

interface InvitedBuddyItemProps {
  user: UserWithId;
  onAccept: () => void;
  onDelete: () => void;
}

export const InvitedBuddyItem = ({
  user,
  onAccept,
  onDelete,
}: InvitedBuddyItemProps): React.JSX.Element => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Người dùng SnapStep';
  const defaultAvatar =
    user.avatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250';

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
      <View style={styles.buttonGroup}>
        <Pressable
          style={({ pressed }) => [
            styles.acceptBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={onAccept}
        >
          <Text style={styles.acceptBtnText}>Đồng ý</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.deleteBtn,
            pressed && styles.btnPressed,
          ]}
          onPress={onDelete}
        >
          <Text style={styles.deleteBtnText}>Xóa</Text>
        </Pressable>
      </View>
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
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
  },
  acceptBtnText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: Colors.surfaceBright,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  deleteBtnText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
});
