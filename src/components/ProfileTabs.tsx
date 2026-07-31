import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';
import { RootStackParamList } from '../navigation/types';
import { SavedTripCard, SavedTripInfo } from './SavedTripCard';

interface Snap {
  id: string;
  image: string;
}

interface SavedRoute {
  id: string;
  title: string;
  location: string;
  image: string;
}
const MOCK_SNAPS: Snap[] = [
  { id: '1', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=300' },
  { id: '2', image: 'https://images.unsplash.com/photo-1552308995-2baac1ad5490?q=80&w=300' },
  { id: '3', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=300' },
  { id: '4', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=300' },
  { id: '6', image: 'https://images.unsplash.com/photo-1579482596426-ed87654bf3ee?q=80&w=300' },
];

const MOCK_ROUTES: SavedTripInfo[] = [
  {
    id: '1',
    title: 'Hai Van Pass Loop',
    location: 'Da Nang, VN',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=300',
  },
  {
    id: '2',
    title: 'Hoi An Heritage Walk âfafadfsdgsdgầfaskfndlkfnadkfanfkasnf]oaksnfaksf',
    location: 'Quang Nam, VN',
    image: 'https://images.unsplash.com/photo-1552308995-2baac1ad5490?q=80&w=300',
  },
];

export const ProfileTabs = (): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<'snaps' | 'routes'>('snaps');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const navigateToExpoloreMe = () =>{
     console.log("Xem thêm...");
  }
  const navigateToSavedTrip = () =>{
     navigation.navigate('AllSavedTrips');
  }

 



  return (
    <View style={styles.container}>
      {/* Các tab chuyển đổi */}
      <View style={styles.tabsHeader}>
        <Pressable style={styles.tab} onPress={() => setActiveTab('snaps')}>
          <Text style={[styles.tabText, activeTab === 'snaps' && styles.activeTabText]}>
            My Snaps
          </Text>
          {activeTab === 'snaps' && <View style={styles.activeIndicator} />}
        </Pressable>
        
        <Pressable style={styles.tab} onPress={() => setActiveTab('routes')}>
          <Text style={[styles.tabText, activeTab === 'routes' && styles.activeTabText]}>
            Saved Routes
          </Text>
          {activeTab === 'routes' && <View style={styles.activeIndicator} />}
        </Pressable>
      </View>

      {/* Nội dung tab */}
      {activeTab === 'snaps' ? (
        <View style={styles.snapsGrid}>
          {MOCK_SNAPS.map((snap) => (
            <View key={snap.id} style={styles.snapImageContainer}>
              <Image source={snap.image} style={styles.snapImage} contentFit="cover" transition={300} />
              
            </View>
            
          ))}
          <View style={styles.snapImageContainer}>
             <Pressable
               onPress={navigateToExpoloreMe}
              style={{flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:'rgba(255,255,255,0.05)'}}>
               <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.text}>Xem thêm...</Text>
            </View>
             </Pressable>
            </View>
        </View>
      ) : (
        <View style={styles.routesList}>
          {MOCK_ROUTES.map((route) => (
            <SavedTripCard 
              key={route.id} 
              trip={route} 
              onPress={(tripId) => navigation.navigate('SavedTrip', { tripId })} 
            />
          ))}
           <View  style={styles.routeCard}>
             <Pressable
               onPress={navigateToSavedTrip}
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
               <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={styles.text}>Xem thêm...</Text>
            </View>
             </Pressable>
            </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: Colors.primary,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 2,
    backgroundColor: Colors.primary,
  },
  snapsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    paddingHorizontal: 2,
  },
  snapImageContainer: {
    width: (Value.widthScreen - 8) / 3,
    aspectRatio: 4 / 5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  snapImage: {
    width: '100%',
    height: '100%',
  },
  routesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    marginBottom: 12,
  },
  text:{
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  }
});
