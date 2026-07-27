import React, { useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Marker } from 'react-native-maps';
import { Colors } from '../constants/Colors';
import { ExplorePost } from './ExplorePostCard';

interface MapMarkerItemProps {
  post: ExplorePost & { latitude: number; longitude: number };
  onPress: () => void;
}

export const MapMarkerItem = ({ post, onPress }: MapMarkerItemProps): React.JSX.Element => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Marker
      key={`${post.id}-${loaded}`}
      coordinate={{ latitude: post.latitude, longitude: post.longitude }}
      onPress={onPress}
    >
      <View style={styles.customMarker}>
        <View style={styles.markerImageContainer}>
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.markerImage}
            resizeMode="cover"
            onLoad={() => setLoaded(true)}
          />
        </View>
        <View style={styles.markerPointer} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 80,
  },
  markerImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    alignSelf: 'center',
    marginTop: -2.5,
  },
});
