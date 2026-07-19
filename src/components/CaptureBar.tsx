import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface CaptureBarProps {
  thumbnailUri?: string;
  locationTag?: string;
  onShutterPress?: () => void;
  onThumbnailPress?: () => void;
}

export const CaptureBar = ({
  thumbnailUri = 'https://cdn3.ivivu.com/2026/03/du-lich-da-lat-ivivu.jpg',
  locationTag = 'Da Lat, 2m ago',
  onShutterPress,
  onThumbnailPress,
}: CaptureBarProps): React.JSX.Element => {
  return (
    <View style={styles.captureContainer}>
      {/* Recent Photo Thumbnail */}
      <Pressable
        onPress={onThumbnailPress}
        style={({ pressed }) => [
          styles.thumbnailCard,
          pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
        ]}
      >
        <Image
          source={{ uri: thumbnailUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={styles.thumbnailOverlay}>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={10} color="#FF6B6B" />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationTag}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Shutter Button */}
      <View style={styles.shutterCenterWrapper}>
        <Pressable
          aria-label="Take picture"
          onPress={onShutterPress}
          style={({ pressed }) => [
            styles.shutterOuterRing,
            pressed && { scale: 0.92, opacity: 0.9 },
          ]}
        >
          <View style={styles.shutterInnerCircle} />
        </Pressable>
      </View>

      {/* Spacer for alignment */}
      <View style={styles.thumbnailSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  captureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 'auto',
    marginBottom: 20,
    position: 'relative',

  },
  thumbnailCard: {
    width: 76,
    height: 100,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '600',
  },
  shutterCenterWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  shutterInnerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
  },
  thumbnailSpacer: {
    width: 76,
  },
});
