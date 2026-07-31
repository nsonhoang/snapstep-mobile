import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

// Interface định nghĩa cấu trúc dữ liệu của 1 chuyến đi
export interface SavedTripInfo {
  id: string;
  title: string;
  location: string;
  image: string;
}

interface SavedTripCardProps {
  trip: SavedTripInfo;
  onPress?: (tripId: string) => void;
}

export const SavedTripCard = ({ trip, onPress }: SavedTripCardProps): React.JSX.Element => {
  return (
    <Pressable 
      style={styles.routeCard}
      onPress={() => onPress?.(trip.id)}
    >
      <Image source={trip.image} style={styles.routeImage} contentFit="cover" transition={300} />
      <View style={styles.routeInfo}>
        <Text style={styles.routeTitle} numberOfLines={2} ellipsizeMode="tail">{trip.title}</Text>
        <View style={styles.routeLocationRow}>
          <MaterialIcons name="location-on" size={12} color={Colors.textMuted} />
          <Text style={styles.routeLocation} numberOfLines={1} ellipsizeMode="tail">{trip.location}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    marginBottom: 12,
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
