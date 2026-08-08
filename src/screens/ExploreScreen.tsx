import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ExploreScreenProps } from '../navigation/types';
import { ExploreSearchBar } from '../components/ExploreSearchBar';
import { ExploreFilterChips, FilterChipItem } from '../components/ExploreFilterChips';
import { ExplorePostCard, ExplorePost } from '../components/ExplorePostCard';

import { ExploreSkeleton } from '../components/ExploreSkeleton';
import { collection, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import { useAuth } from '../navigation/AuthContext';
import { User } from '../services/userService';

const MOCK_FILTER_CHIPS: FilterChipItem[] = [
  { id: 'all', label: 'Tất cả' },
  { id: '1', label: 'Me', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250' },
  { id: '2', label: 'Besties' },
  { id: '3', label: 'Minh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250' },
  { id: '4', label: 'An', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250' },
  { id: '5', label: 'Lan' },
];

const MOCK_POSTS: ExplorePost[] = [
  {
    id: 'post-1',
    userId:"1",
    imageUrl: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?q=80&w=800',
    location: 'Sa Pa',
    timeAgo: '2h ago',
    userName: 'Minh Hoàng',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250',
    title: 'Săn mây ngắm ruộng bậc thang Mường Hoa 🌾',
  },
  {
    id: 'post-2',
    userId:"2",
    imageUrl: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-thumb.jpg',
    location: 'Ha Noi',
    timeAgo: '1d ago',
    userName: 'Bảo An',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250',
    title: 'Nắng sớm thu Hà Nội bên Tháp Rùa ☀️',
  },
  {
    id: 'post-3',
    userId:"3",
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800',
    location: 'Ha Noi',
    timeAgo: '1d ago',
    userName: 'Ngọc Lan',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250',
    title: 'Chiều bình yên bên Hồ Tây chill chill 🌅',
  },
  {
    id: 'post-4',
    userId:"3",
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=800',
    location: 'Ha Noi',
    timeAgo: '1d ago',
    userName: 'Tuấn Kiệt',
    title: 'Phố cổ về đêm rực rỡ sắc màu 🏮',
  },
  {
    id: 'post-5',
    userId:"2",
    imageUrl: 'https://vcdn1-dulich.vnecdn.net/2022/06/01/Hoi-An-VnExpress-5851-16488048-4863-2250-1654057244.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=k1SeSD7zn2e69TSWKfpoag',
    location: 'Hoi An',
    timeAgo: '30m ago',
    userName: 'Phương Anh',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250',
    title: 'Thả hoa đăng cầu may trên sông Hoài ✨',
  },
  {
    id: 'post-6',
    userId:"1",
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800',
    location: 'Da Lat',
    timeAgo: '4h ago',
    userName: 'Đức Anh',
    title: 'Đón hừng đông rực rỡ ở đồi thông Đà Lạt 🌲',
  },
];

export const ExploreScreen = ({ navigation }: ExploreScreenProps): React.JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedChipId, setSelectedChipId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(true);
   const db = getFirestore();
   const { user } = useAuth();
// create user 
useEffect(  ()=>{
const createUser =async()=>{
  if(!user?.uid) return 
 const userQuery = await getDoc(doc(db,"users",user?.uid))
 if(!userQuery.exists()){
  const newUser: User = {
    firstName: user?.displayName || '',
    lastName: "",
    email: user?.email || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ghostMode: false,
    stats: {
      conqueredProvincesCount: 0,
      totalPhotosCount: 0,
    },
    conqueredProvinces:{}
  }
    await setDoc(doc(db, "users", user?.uid), newUser).then(
              ()=>{
                console.log("add user to database")
              }
            )
 }
}
createUser();
},[])

  // Initial load effect for Skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter posts by search query
  const filteredPosts = useMemo(() => {
    if (selectedChipId === 'all') {
      return MOCK_POSTS.filter((post) =>
        post.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return MOCK_POSTS.filter((post) =>
        post.userId === selectedChipId &&
        post.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [searchQuery, selectedChipId]);

  const handlePressPost = useCallback((post: ExplorePost): void => {
    navigation.navigate('PostDetail', { post, posts: filteredPosts });
  }, [navigation, filteredPosts]);

  const renderPostItem = useCallback(({ item }: { item: ExplorePost }) => (
    <View style={viewMode === 'grid' ? styles.gridCell : styles.feedCell}>
      <ExplorePostCard
        post={item}
        isFeedMode={viewMode === 'feed'}
        onPressPost={handlePressPost}
      />
    </View>
  ), [viewMode, handlePressPost]);

  // Toggle View Mode with quick Skeleton feedback
  const handleToggleViewMode = (): void => {
    setIsLoading(true);
    const nextMode = viewMode === 'grid' ? 'feed' : 'grid';
    setViewMode(nextMode);

    setTimeout(() => {
      setIsLoading(false);
    }, 350);
  };

  const renderHeader = () => (
    <View>
      <ExploreSearchBar
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
      />
      <ExploreFilterChips
        chips={MOCK_FILTER_CHIPS}
        selectedChipId={selectedChipId}
        onSelectChip={setSelectedChipId}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {renderHeader()}

      {isLoading ? (
        <ExploreSkeleton viewMode={viewMode} />
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            key={viewMode === 'grid' ? 'grid-list' : 'feed-list'}
            data={filteredPosts}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            renderItem={renderPostItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      )}

      {/* Dynamic View Toggle FAB */}
      <Pressable
        onPress={handleToggleViewMode}
        style={({ pressed }) => [
          styles.fab,
          pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
        ]}
      >
        <Feather
          name={viewMode === 'grid' ? 'list' : 'grid'}
          size={22}
          color={Colors.black}
        />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flatListContent: {
    paddingHorizontal: 10,
    paddingBottom: 90,
  },
  gridCell: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  feedCell: {
    width: '100%',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
});
