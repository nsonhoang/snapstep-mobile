import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { Colors } from '../constants/Colors';

export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isOnline: boolean;
}

interface ChatItemProps {
  item: Chat;
  onPress?: () => void;
}

export const ChatItem = React.memo(({ item, onPress }: ChatItemProps): React.JSX.Element => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chatItem,
        pressed && styles.chatItemPressed,
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineBadge} />}
      </View>

      {/* Message Info */}
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text
            style={[
              styles.chatTime,
              item.unread > 0 && { color: Colors.primary, fontWeight: '600' },
            ]}
          >
            {item.time}
          </Text>
        </View>
        
        <View style={styles.chatFooter}>
          <Text
            style={[
              styles.lastMessage,
              item.unread > 0 && { color: Colors.white, fontWeight: '500' },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  chatItemPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
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
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
    paddingRight: 10,
  },
  chatTime: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMuted,
    paddingRight: 20,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 22,
  },
  unreadText: {
    color: Colors.black,
    fontSize: 12,
    fontWeight: '700',
  },
});
