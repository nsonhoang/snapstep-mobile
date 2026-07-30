import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';

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
  { id: '5', image: 'https://images.unsplash.com/photo-1621217036665-225302bfb8d5?q=80&w=300' },
  { id: '6', image: 'https://images.unsplash.com/photo-1579482596426-ed87654bf3ee?q=80&w=300' },
];

const MOCK_ROUTES: SavedRoute[] = [
  {
    id: '1',
    title: 'Hai Van Pass Loop',
    location: 'Da Nang, VN',
    image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=300',
  },
  {
    id: '2',
    title: 'Hoi An Heritage Walk',
    location: 'Quang Nam, VN',
    image: 'https://images.unsplash.com/photo-1552308995-2baac1ad5490?q=80&w=300',
  },
];

export const ProfileTabs = (): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState<'snaps' | 'routes'>('snaps');

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
        </View>
      ) : (
        <View style={styles.routesList}>
          {MOCK_ROUTES.map((route) => (
            <View key={route.id} style={styles.routeCard}>
              <Image source={route.image} style={styles.routeImage} contentFit="cover" transition={300} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeTitle}>{route.title}</Text>
                <View style={styles.routeLocationRow}>
                  <MaterialIcons name="location-on" size={12} color={Colors.textMuted} />
                  <Text style={styles.routeLocation}>{route.location}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
            </View>
          ))}
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
  },
  routeImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  routeInfo: {
    flex: 1,
    gap: 4,
  },
  routeTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  routeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeLocation: {
    color: Colors.textMuted,
    fontSize: 10,
  },
});
