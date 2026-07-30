import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Pressable, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SearchBar } from '../components/SearchBar';
import { BuddySkeleton } from '../components/BuddySkeleton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SearchBuddies'>;

interface Buddy {
  id: string;
  name: string;
  mutual: string;
  avatar: string;
}

const MOCK_BUDDIES: Buddy[] = [
  { id: '1', name: 'Alice Nguyen gsdgsdgsdfg', mutual: '12 mutual friends', avatar: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=250' },
  { id: '2', name: 'Bob Tran', mutual: 'Travel Crew member', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=250' },
  { id: '3', name: 'Charlie', mutual: '2 mutual friends', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250' },
];
 const MOCK_INVITED: Buddy[] = [
  { id: '1', name: 'Alice Nguyen fsadgfsdgsgdgsdgfsdgsdfsdfsdfdfds', mutual: '12 mutual friends', avatar: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=250' },
  { id: '2', name: 'Bob Tran', mutual: 'Travel Crew member', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=250' },
  { id: '3', name: 'Charlie', mutual: '2 mutual friends', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250' },
];

export const SearchBuddiesScreen = ({ navigation }: Props): React.JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const renderBuddy = ({ item }: { item: Buddy }) => (
    
    <View style={styles.buddyItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        {/* <Text style={styles.mutual}>{item.mutual}</Text> */}
      </View>
      <Pressable style={styles.addBtn}>
        <Text style={styles.addBtnText}>Add</Text>
      </Pressable>
    </View>
  );

  const renderInvited = ({ item }: { item: Buddy }) => (
    <View style={styles.buddyItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">{item.name}</Text>
        {/* <Text style={styles.mutual}>{item.mutual}</Text> */}
      </View>
    <View style ={styles.buttonContainer}>
        <Pressable style={styles.addBtn}>
        <Text style={styles.addBtnText}>Accept</Text>
      </Pressable>
       <Pressable style={styles.deleteBtn}>
        <Text style={styles.DelBtnText}>Delete</Text>
      </Pressable>
    </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Search Buddies</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name or email..."
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Invited</Text>
        {isLoading ? (
          <View style={styles.listContent}>
            {[1, 2].map(key => (
              <BuddySkeleton key={`inv-${key}`} hasTwoButtons />
            ))}
          </View>
        ) : (
          <View style={styles.listContent}>
            {MOCK_INVITED.map(item => (
              <React.Fragment key={item.id}>
                {renderInvited({ item })}
              </React.Fragment>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Suggested</Text>
        {isLoading ? (
          <View style={styles.listContent}>
            {[1, 2, 3, 4].map(key => (
              <BuddySkeleton key={`sug-${key}`} />
            ))}
          </View>
        ) : (
          <View style={styles.listContent}>
            {MOCK_BUDDIES.map(item => (
              <React.Fragment key={item.id}>
                {renderBuddy({ item })}
              </React.Fragment>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
  },
  spacer: {
    width: 36, // to balance the chevron icon and center the title
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  buddyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surface,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  mutual: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  buttonContainer:{
    gap:5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: 14,
  },
   deleteBtn: {
    borderWidth: 1,
    
    borderColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
   },
   DelBtnText:{
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
   }
});
