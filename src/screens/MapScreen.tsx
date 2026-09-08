import React, { useState, useMemo, useRef } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import MapView, { PROVIDER_DEFAULT } from "react-native-maps";
import { Colors } from "../constants/Colors";
import { MapScreenProps } from "../navigation/types";
import { PostWithId } from "../services/postService";
import { MapMarkerItem } from "../components/MapMarkerItem";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useAlert } from "../components/AlertProvider";
import { usePostStore } from "../stores/postStore";

export const MAP_DARK_STYLE = [
  {
    elementType: "geometry",
    stylers: [{ color: "#121212" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#121212" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#747474" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#dfdfdf" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#a5a5a5" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1d1d1d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];

export const MapScreen = ({
  navigation,
}: MapScreenProps): React.JSX.Element => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const { showAlert } = useAlert();
  const { posts } = usePostStore();

  const mapRef = useRef<MapView>(null);

  // Lọc chỉ những bài viết có tọa độ VÀ đăng trong vòng 24h
  const mapMarkers = useMemo(() => {
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    return posts.filter((post) => {
      // 1. Phải có tọa độ hợp lệ
      if (!post.location?.latitude || !post.location?.longitude) return false;

      // 2. Phải đăng trong vòng 24 giờ
      let postTime = now; // Mặc định là hiện tại (dành cho bài vừa đăng, server chưa kịp trả về timestamp)
      if (
        post.createdAt &&
        typeof (post.createdAt as any).toMillis === "function"
      ) {
        postTime = (post.createdAt as any).toMillis();
      }

      return now - postTime <= TWENTY_FOUR_HOURS;
    });
  }, [posts]);

  const handleCalloutPress = (post: PostWithId) => {
    navigation.navigate("PostDetail", { post, posts: mapMarkers });
    console.log("Callout pressed");
  };

  const handleConquestPress = () => {
    console.log("Conquest pressed");
    navigation.navigate("Conquest");
  };

  const handleMyLocationPress = async () => {
    console.log("My location pressed");

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      showAlert({
        title: "Permission to access location was denied",
        message: "Please enable location access to use this feature",
        type: "error",
      });
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    if (!currentLocation) {
      console.log("Location not found");
      showAlert({
        title: "Location not found",
        message: "Please enable location access to use this feature",
        type: "error",
      });
      return;
    }
    setLocation(currentLocation);

    // Lia bản đồ về vị trí hiện tại
    mapRef.current?.animateToRegion(
      {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05, // Zoom gần lại hơn một chút để rõ
        longitudeDelta: 0.05,
      },
      1000,
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
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
        {mapMarkers.map((post) => (
          <MapMarkerItem
            key={post.id}
            post={post}
            onPress={() => handleCalloutPress(post)}
          />
        ))}
      </MapView>

      {/* Floating FAB conquest */}
      <View style={[styles.floatingFAB, styles.buttonConquest]}>
        <Pressable style={styles.FAB} onPress={handleConquestPress}>
          <Ionicons name="bar-chart" size={24} color={Colors.white} />
        </Pressable>
      </View>
      {/* Floating FAB my location */}
      <View style={[styles.floatingFAB, styles.buttonLocation]}>
        <Pressable style={styles.FAB} onPress={handleMyLocationPress}>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.white,
    marginTop: 12,
    fontSize: 16,
  },

  floatingFAB: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonConquest: {
    position: "absolute",
    right: 10,
    bottom: 20,
  },
  buttonLocation: {
    position: "absolute",
    right: 10,
    bottom: 80,
  },
  FAB: {
    width: 25,
    height: 25,
  },
});
