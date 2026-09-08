import React, { useState, useEffect } from "react";
import { StyleSheet, View, Image } from "react-native";
import { Marker } from "react-native-maps";
import { useIsFocused } from "@react-navigation/native";
import { Colors } from "../constants/Colors";
import { PostWithId } from "../services/postService";

interface MapMarkerItemProps {
  post: PostWithId;
  onPress: () => void;
}

export const MapMarkerItem = ({
  post,
  onPress,
}: MapMarkerItemProps): React.JSX.Element => {
  const [loaded, setLoaded] = useState(false);
  const isFocused = useIsFocused();

  // Reset state loaded khi màn hình focus lại
  // để ép Image báo onLoad() lại một lần nữa
  useEffect(() => {
    if (isFocused) {
      setLoaded(false);
    }
  }, [isFocused]);

  return (
    <Marker
      // Đổi key dựa trên isFocused:
      // Kỹ thuật này ép React xóa sổ hoàn toàn Marker cũ ở tầng Native
      // và tạo mới 100% khi bạn quay lại màn hình.
      // Không còn bất kỳ data rác hay lỗi kẹt cảm ứng nào có thể xảy ra!
      key={`${post.id}-${isFocused}`}
      coordinate={{
        latitude: post.location?.latitude || 0,
        longitude: post.location?.longitude || 0,
      }}
      onPress={onPress}
      tracksViewChanges={!loaded}
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
    alignItems: "center",
    justifyContent: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  markerImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: Colors.primary,
    alignSelf: "center",
    marginTop: -2.5,
  },
});
