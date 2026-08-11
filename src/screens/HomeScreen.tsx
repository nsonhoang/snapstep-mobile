import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useAuthStore } from "../stores/authStore";
import { HomeScreenProps } from "../navigation/types";
import { Colors } from "../constants/Colors";
import { useAlert } from "../components/AlertProvider";
import { CameraHeader } from "../components/CameraHeader";
import { Location } from "../services/postService";

import { CameraToggles } from "../components/CameraToggles";
import { CaptureBar } from "../components/CaptureBar";
import { PhotoPreviewModal } from "../components/PhotoPreviewModal";
import {
  useCameraPermission,
  Camera,
  usePhotoOutput,
  CameraRef,
} from "react-native-vision-camera";
import { createLocation } from "react-native-vision-camera-location";
import { useLocation } from "../hooks/useLocation";
import { ImageUtils } from "../utils/imageUtils";
import { ImageService } from "../services/imageService";
import { useTripStore } from "../stores/tripStore";
import { Post, PostService } from "../services/postService";
import { serverTimestamp } from "@react-native-firebase/firestore";

export const HomeScreen = ({
  navigation,
}: HomeScreenProps): React.JSX.Element => {
  const { hasPermission, requestPermission } = useCameraPermission();

  const photoOutput = usePhotoOutput();
  const cameraRef = useRef<CameraRef>(null);

  const { logout, user } = useAuthStore();
  const { selectedTripId } = useTripStore();
  const { showAlert } = useAlert();

  const [facing, setFacing] = useState<"back" | "front">("back");
  const [isGhostModeOn, setIsGhostModeOn] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("Besties 💖");
  const [flashMode, setFlashMode] = useState<"on" | "off" | "auto">("off");
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | undefined>(
    undefined,
  );
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showCustomToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Dùng chung 1 hook useLocation duy nhất của chúng ta
  const { location, errorMsg, isLoading, refetch } = useLocation();

  const fadeValue = useSharedValue(0);

  useEffect(() => {
    fadeValue.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
  }, [fadeValue]);

  useEffect(() => {
    // 1. Xin quyền Camera
    if (!hasPermission) {
      requestPermission();
    }
    // 2. Xin quyền Vị trí (dùng hook của chúng ta, nó có tích hợp sẵn xin quyền)
    refetch();
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeValue.value,
    };
  });

  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(
    null,
  );

  const handleTouch = async (e: any) => {
    const { locationX, locationY } = e.nativeEvent;

    // Lưu tọa độ để vẽ vòng tròn
    setFocusPoint({ x: locationX, y: locationY });

    try {
      // Yêu cầu Camera lấy nét tại điểm chạm (VisionCamera v5)
      await cameraRef.current?.focusTo({ x: locationX, y: locationY });
    } catch (err) {
      console.log("Lỗi focus:", err);
    }

    // Ẩn vòng tròn sau 1.5 giây
    setTimeout(() => {
      setFocusPoint((prev) => {
        return prev?.x === locationX && prev?.y === locationY ? null : prev;
      });
    }, 1500);
  };

  // Chuyển sang camera trước / sau
  const flipCamera = () => {
    setFacing((prevFacing) => (prevFacing === "back" ? "front" : "back"));
  };

  // Bật flash
  const toggleFlash = () => {
    setFlashMode((current) => {
      if (current === "off") return "on";
      if (current === "on") return "auto";
      return "off";
    });
  };

  const handleBackPress = (): void => {
    navigation.navigate("MainTabs", { screen: "Explore" });
  };

  const handleSettingsPress = (): void => {
    showAlert({
      title: "Cài đặt SnapStep",
      message: "Bạn có muốn mở Cài đặt hay Đăng xuất?",
      type: "info",
      confirmText: "Đăng xuất",
      cancelText: "Đóng",
      onConfirm: logout,
    });
  };

  const handleGroupPress = (): void => {
    const groups = [
      "Besties 💖",
      "Travel Buddies ✈️",
      "Family 🏡",
      "Solo Explorer 🧭",
    ];
    const currentIndex = groups.indexOf(selectedGroup);
    const nextGroup = groups[(currentIndex + 1) % groups.length];
    setSelectedGroup(nextGroup);
    showAlert({
      title: "Đã chuyển nhóm",
      message: `Đã đổi sang nhóm chia sẻ: ${nextGroup}`,
      type: "success",
    });
  };

  // Chụp ảnh
  const handleShutterPress = async () => {
    if (cameraRef.current && photoOutput) {
      try {
        // 1. Chuyển đổi tọa độ của hook thành format của VisionCamera
        const visionLocation = location
          ? createLocation(location.latitude, location.longitude)
          : undefined;
        // 2. Gọi lệnh chụp và truyền location vào
        const photo = await photoOutput.capturePhotoToFile(
          {
            flashMode:
              flashMode === "auto" ? "auto" : flashMode === "on" ? "on" : "off",
            location: visionLocation, // Bắt buộc truyền cái này thì ảnh mới có GPS
          },
          {},
        );

        if (photo?.filePath) {
          console.log("Đã chụp ảnh gốc, đường dẫn:", photo.filePath);

          // Gọi ImageUtils để nén ảnh siêu tốc bằng C++

          // 3. LẤY THÔNG TIN LOCATION & TIMESTAMP TỪ BỨC ẢNH CHỤP XONG
          console.log("--- THÔNG TIN ẢNH ---");

          const timestamp = new Date().toISOString();
          console.log("Thời gian chụp:", timestamp);
          // console.log('Toàn bộ siêu dữ liệu ảnh:', JSON.stringify(photo.metadata, null, 2));

          // Vị trí (Kinh độ/Vĩ độ/Tên đường) - Lấy từ hook đã lưu sẵn
          console.log("Vị trí chụp:", location);

          // Lưu ảnh đã nén (compressedUri đã bao gồm file://) để hiển thị Preview
          setCapturedPhotoUri(`file://${photo.filePath}`);
          setIsPreviewVisible(true);
        }
      } catch (error) {
        console.error("Lỗi khi chụp ảnh:", error);
      }
    }
  };

  const handlePostPhoto = async (captionText: string): Promise<void> => {
    try {
      // lưu hình ảnh lên storage
      if (user && capturedPhotoUri) {
        const rawPath = capturedPhotoUri?.replace("file://", "");
        const compressedUri = await ImageUtils.compressImage(rawPath);
        console.log("Đã nén ảnh trước khi Up:", compressedUri);
        const imageUrl = await ImageService.uploadImage(
          compressedUri,
          user?.uid,
        );
        console.log("URL của ảnh trên Storage:", imageUrl);
        if (imageUrl && selectedTripId) {
          const position: Location = {
            address: location?.address || "Vị trí không xác định",
            longitude: location?.longitude || 0,
            latitude: location?.latitude || 0,
          };

          const post: Post = {
            authorId: user.uid,
            imageUrl,
            caption: captionText,
            tripId: selectedTripId,
            location: position,
            createdAt: serverTimestamp(),
            updateAt: serverTimestamp(),
          };
          await PostService.createPost(post);

          showCustomToast("Đăng bài thành công!");
        }
        setIsPreviewVisible(false);
      }
    } catch (error) {
      console.log(error);
      showAlert({
        title: "Lỗi",
        message: "Không thể tạo bài viết.",
        type: "error",
      });
    }
  };

  const handleThumbnailPress = (): void => {
    if (capturedPhotoUri) {
      setIsPreviewVisible(true);
    } else {
      showAlert({
        title: "Thư viện hành trình",
        message: "Chưa có ảnh mới. Hãy bấm nút chụp để chụp bức ảnh đầu tiên!",
        type: "info",
      });
    }
  };

  // Trạng thái: Người dùng chưa cấp quyền hoặc đã từ chối
  if (!hasPermission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.infoText}>
          Chúng tôi cần quyền sử dụng Camera của bạn
        </Text>
        <Pressable style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Cấp Quyền</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screenBackground}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <SafeAreaView style={styles.safeArea}>
          {/* 1. Header Navigation Component */}
          <CameraHeader
            selectedGroup={selectedGroup}
            onBackPress={handleBackPress}
            onGroupPress={handleGroupPress}
            onSettingsPress={handleSettingsPress}
          />

          {/* 2. Camera Viewport Component */}
          <View style={styles.previewContainer} onTouchEnd={handleTouch}>
            <Camera
              ref={cameraRef}
              style={styles.cameraView}
              device={facing}
              isActive={true}
              enableNativeZoomGesture={true}
              outputs={[photoOutput]}
            />
            {/* Hiệu ứng Focus Icon */}
            {focusPoint && (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(400)}
                style={[
                  styles.focusIndicator,
                  {
                    left: focusPoint.x - 30, // trừ nửa width để tâm vào đúng điểm chạm
                    top: focusPoint.y - 30,
                  },
                ]}
              />
            )}
          </View>

          {/* 3. Camera Controls / Toggles Component */}
          <CameraToggles
            isFlashOn={flashMode}
            isGhostModeOn={isGhostModeOn}
            onToggleFlash={toggleFlash}
            onFlipCamera={flipCamera}
            onToggleGhostMode={() => {
              setIsGhostModeOn(!isGhostModeOn);
              showAlert({
                title: "Ghost Mode",
                message: !isGhostModeOn
                  ? "Chế độ Ẩn danh (Ghost Mode) đã BẬT"
                  : "Chế độ Ẩn danh (Ghost Mode) đã TẮT",
                type: !isGhostModeOn ? "success" : "info",
              });
            }}
          />

          {/* 4. Bottom Capture Bar Component */}
          <CaptureBar
            thumbnailUri={capturedPhotoUri}
            onShutterPress={handleShutterPress}
            onThumbnailPress={handleThumbnailPress}
          />
        </SafeAreaView>
      </Animated.View>

      {/* Full Photo Inspection & Post Preview Modal */}
      <PhotoPreviewModal
        visible={isPreviewVisible}
        photoUri={capturedPhotoUri}
        onClose={() => setIsPreviewVisible(false)}
        onRetake={() => {
          setCapturedPhotoUri(undefined);
          setIsPreviewVisible(false);
        }}
        onPost={handlePostPhoto}
      />

      {/* Hiệu ứng Toast chữ nổi */}
      {toastMessage && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={styles.toastContainer}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenBackground: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  infoText: {
    color: Colors.white,
    fontSize: 15,
    textAlign: "center",
  },
  permissionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  permissionBtnText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "700",
  },
  previewContainer: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 15,
    elevation: 8,
  },
  cameraView: {
    flex: 1,
  },
  focusIndicator: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#FFD700",
    backgroundColor: "rgba(255, 215, 0, 0.15)",
  },
  toastContainer: {
    position: "absolute",
    bottom: 120, // Hiển thị phía dưới để dễ nhìn hơn
    alignSelf: "center",
    backgroundColor: Colors.white, // Đậm hơn
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30, // Bo góc tròn hơn
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  toastText: {
    color: Colors.black,
    fontSize: 16, // Chữ to hơn
    fontWeight: "700", // Đậm hơn
    textAlign: "center",
  },
});
