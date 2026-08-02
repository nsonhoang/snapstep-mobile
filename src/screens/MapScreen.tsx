import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Platform, Pressable,  } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Colors } from '../constants/Colors';
import { MapScreenProps } from '../navigation/types';
import { ExplorePost } from '../components/ExplorePostCard';
import { MapMarkerItem } from '../components/MapMarkerItem';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { AlertProvider } from '../components/AlertProvider';
import { useAlert } from '../components/AlertProvider';

export const MAP_DARK_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#121212" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#121212" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#747474" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#dfdfdf" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#a5a5a5" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#181818" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1d1d1d" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#8a8a8a" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#3c3c3c" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#000000" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#3d3d3d" }]
  }
];

const MAP_POSTS: (ExplorePost & { latitude: number; longitude: number })[] = [
  {
    id: 'post-1',
    userId: '13',
    imageUrl: 'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?q=80&w=800',
    location: 'Sa Pa',
    timeAgo: '2h ago',
    userName: 'Minh Hoàng',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250',
    title: 'Săn mây ngắm ruộng bậc thang Mường Hoa 🌾',
    latitude: 22.3364,
    longitude: 103.8438,
  },
  {
    id: 'post-2',
    userId: '22',
    imageUrl: 'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/01/dia-diem-du-lich-o-ha-noi-thumb.jpg',
    location: 'Ha Noi',
    timeAgo: '1d ago',
    userName: 'Bảo An',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250',
    title: 'Nắng sớm thu Hà Nội bên Tháp Rùa ☀️',
    latitude: 21.0285,
    longitude: 105.8542,
  },
  {
    id: 'post-5',
    userId: '11',
    imageUrl: 'https://vcdn1-dulich.vnecdn.net/2022/06/01/Hoi-An-VnExpress-5851-16488048-4863-2250-1654057244.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=k1SeSD7zn2e69TSWKfpoag',
    location: 'Hoi An',
    timeAgo: '30m ago',
    userName: 'Phương Anh',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250',
    title: 'Thả hoa đăng cầu may trên sông Hoài ✨',
    latitude: 15.8801,
    longitude: 108.3380,
  },
  {
    id: 'post-6',
    userId: '22',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800',
    location: 'Da Lat',
    timeAgo: '4h ago',
    userName: 'Đức Anh',
    title: 'Đón hừng đông rực rỡ ở đồi thông Đà Lạt 🌲',
    latitude: 11.9404,
    longitude: 108.4583,
  },
];




export const MapScreen = ({ navigation }: MapScreenProps): React.JSX.Element => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
 const { showAlert } = useAlert();  

  const handleCalloutPress = (post: ExplorePost) => {
    navigation.navigate('PostDetail', { post, posts: MAP_POSTS });
    console.log('Callout pressed');
  };

  const handleConquestPress = () => {
    console.log('Conquest pressed');
    navigation.navigate('Conquest');

  };

  const handleMyLocationPress = async () => {
    console.log('My location pressed');
    // này sau cài thư viện location
   
    let { status } = await Location.requestForegroundPermissionsAsync();
    if(status !== 'granted'){
      console.log('Permission to access location was denied');
      showAlert({
        title: 'Permission to access location was denied',
        message: 'Please enable location access to use this feature',
        type: 'error',
      });
      return 
    }
     let currentLocation = await Location.getCurrentPositionAsync({});
     if(!currentLocation){
      console.log('Location not found');
       showAlert({
        title: 'Location not found',
        message: 'Please enable location access to use this feature',
        type: 'error',
      });
      return 
    }
    setLocation(currentLocation);
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        showsMyLocationButton={false}
        showsUserLocation={true}
        style={styles.map}
        initialRegion={{
          latitude: 16.0471,
          longitude: 108.2068,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        customMapStyle={MAP_DARK_STYLE}
       
        userInterfaceStyle="dark"
      >
        {MAP_POSTS.map((post) => (
          <MapMarkerItem
            key={post.id}
            post={post}
            onPress={() => handleCalloutPress(post)}
          />
        ))}
      </MapView>

      {/* Floating FAB conquest */}
      <View style={[styles.floatingFAB,styles.buttonConquest]}>
        <Pressable style={styles.FAB} onPress={handleConquestPress}>
         <Ionicons name="bar-chart" size={24} color={Colors.white} />
        </Pressable>
      </View>
       {/* Floating FAB my location */}
      <View style={[styles.floatingFAB, styles.buttonLocation]}>
        <Pressable style={styles.FAB} onPress={handleMyLocationPress} >
         <MaterialIcons name="my-location" size={24} color={Colors.white} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.white,
    marginTop: 12,
    fontSize: 16,
  },
 
  floatingFAB: {
  
    backgroundColor:Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonConquest: {
     position: 'absolute',
    right: 10,
    bottom:20,
  },
  buttonLocation: {
   position: 'absolute',
    right: 10,
    bottom:80,
  },
  FAB: {
  width:25,
    height:25,
  },
  
});
