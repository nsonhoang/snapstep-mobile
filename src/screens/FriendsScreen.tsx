import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SearchBar } from '../components/SearchBar';
import { ChatItem, Chat } from '../components/ChatItem';
import { ChatSkeleton } from '../components/ChatSkeleton';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Travel Crew 🏔️',
    lastMessage: 'Just posted a new photo from Ha Giang!',
    time: '2m ago',
    unread: 3,
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=250',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Alex_W',
    lastMessage: 'That hike looked intense! 🥾',
    time: '1h ago',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250',
    isOnline: true,
  },
  {
    id: '3',
    name: 'Linh_Nguyen',
    lastMessage: 'Are you joining the Tokyo trip next month?',
    time: '3h ago',
    unread: 1,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250',
    isOnline: false,
  },
  {
    id: '4',
    name: 'Marco Polo',
    lastMessage: 'Found a hidden gem near the waterfalls!',
    time: 'Yesterday',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=250',
    isOnline: true,
  },
  {
    id: '5',
    name: 'Sasha_V',
    lastMessage: 'The video you sent is incredible!',
    time: 'Yesterday',
    unread: 0,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
    isOnline: false,
  },
];

export const FriendsScreen = (): React.JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Simulate network loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CHATS;
    return MOCK_CHATS.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const renderChatItem = useCallback(({ item }: { item: Chat }) => {
    return <ChatItem item={item} />;
  }, []);


  const navigateToNewFriends = () => {
    console.log('Navigate to new friends');
    navigation.navigate('SearchBuddies');
  };
  const navigateToNotification = () => {
    navigation.navigate('Notifications');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.iconContainer}>
           <Pressable style={styles.newFriends} onPress={navigateToNotification}>
          <Ionicons name="notifications-outline" size={24} color={Colors.primary} /> 
          {1 ===1 ? <View style={styles.badge} /> : null}
        </Pressable>
        <Pressable style={styles.newFriends} onPress={navigateToNewFriends}>
          <Ionicons name="person-add-outline" size={24} color={Colors.primary} />
          {1 ===1 ? <View style={styles.badge} /> : null}

        </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search friends or chats..."
        />
      </View>

      {/* Chat List */}
      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <ChatSkeleton key={key} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
   
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  newFriends: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:10,
    paddingTop: 10,
    paddingBottom: 16,
  },
  badge:{
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  listContent: {
    paddingBottom: 100, // Leave space for bottom tab
  },
});
