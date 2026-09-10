import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  Pressable,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { LocationJourneySelector } from "./LocationJourneySelector";
import { CustomInput } from "./CustomInput";
import { useAlert } from "../components/AlertProvider";
import Animated, {
  useAnimatedStyle,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useKeyboardHeight } from "../hooks/useKeyboardHeight";
import { useTripStore } from "../stores/tripStore";
import { useAuthStore } from "../stores/authStore";
import { useLocation } from "../hooks/useLocation";
import { Location } from "../services/postService";
import * as LocationExpo from "expo-location";

export interface PhotoPreviewModalProps {
  visible: boolean;
  photoUri?: string;
  onClose: () => void;
  onRetake: () => void;
  onPost?: (
    captionText: string,
    shareToMap: boolean,
    postLocation: Location | null,
  ) => Promise<void>;
}

export const PhotoPreviewModal = ({
  visible,
  photoUri,
  onClose,
  onPost,
}: PhotoPreviewModalProps): React.JSX.Element => {
  const { trips, fetchTrips, selectedTripId, setSelectedTripId } =
    useTripStore();
  const { user } = useAuthStore();
  const {
    location,
    errorMsg: locationErrorMsg,
    isLoading: isLocationLoading,
    refetch: refetchLocation,
  } = useLocation();

  const [shareToMap, setShareToMap] = useState<boolean>(true);
  const [caption, setCaption] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const keyboardHeight = useKeyboardHeight();

  const animatedCaptionStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: keyboardHeight.value, // Dùng value của SharedValue
    };
  });

  console.log("selectedTripId", selectedTripId);

  useEffect(() => {
    if (trips?.length === 0) {
      fetchTrips(user?.uid);
    }
  }, [user?.uid]);

  // Đồng bộ trạng thái shareToMap theo tình trạng vị trí khi mở modal
  useEffect(() => {
    if (visible) {
      if (location) {
        setShareToMap(true);
      } else {
        setShareToMap(false);
      }
    }
  }, [visible]);

  const { showAlert } = useAlert();

  // Xử lý bật/tắt chia sẻ lên bản đồ
  const handleToggleShareToMap = async (val: boolean): Promise<void> => {
    if (val) {
      setShareToMap(true);
      // Khi gạt bật, kích hoạt xin quyền và cập nhật vị trí thời gian thực qua hook

      if (locationErrorMsg) {
        setShareToMap(false);
        setNoticeMessage("Cần cấp quyền truy cập vị trí ở trong cài đặt");
        setTimeout(() => {
          setNoticeMessage(null);
        }, 3000);

        return;
      }

      await refetchLocation();
    } else {
      setShareToMap(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!photoUri) return;

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        await MediaLibrary.Asset.create(
          `file://${photoUri.replace("file://", "")}`,
        );
        console.log("Đã lưu ảnh, đường dẫn:", photoUri);
        showAlert({
          title: "Thành công!",
          message: "Ảnh đã được lưu vào thư viện máy của bạn.",
          type: "success",
        });
      } else {
        showAlert({
          title: "Lỗi",
          message: "Bạn cần cấp quyền truy cập Thư viện để lưu ảnh.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lưu ảnh:", error);
      showAlert({
        title: "Lỗi",
        message: "Không thể lưu ảnh lúc này.",
        type: "error",
      });
    }
  };

  const handlePostPhoto = async () => {
    // 1. Kiểm tra hành trình trước khi upload
    if (!selectedTripId) {
      setNoticeMessage("Vui lòng chọn hành trình trước khi đăng!");
      setTimeout(() => {
        setNoticeMessage(null);
      }, 3000);
      return;
    }

    setIsUploading(true);
    try {
      // Xác định tọa độ gửi kèm: Chỉ lấy khi công tắc BẬT và đã lấy được tọa độ GPS hợp lệ
      const postLoc: Location | null =
        shareToMap && location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              address: location.address || "Vị trí không xác định",
            }
          : null;

      await onPost?.(caption, shareToMap, postLoc);
      setCaption("");
    } catch (error) {
      console.error("Lỗi khi đăng bài viết:", error);
      setNoticeMessage("Đăng bài thất bại, vui lòng thử lại!");
      setTimeout(() => {
        setNoticeMessage(null);
      }, 3000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView
          style={styles.modalContainer}
          pointerEvents={isUploading ? "none" : "auto"}
        >
          {/* Header Navigation */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.iconButton} hitSlop={8}>
              <Feather name="x" size={24} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>Post Preview</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Main Content Area */}
          <View style={styles.content}>
            {/* Photo Card Container */}
            <View style={styles.imageCardContainer}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Feather name="image" size={48} color={Colors.textMuted} />
                </View>
              )}

              {/* Gắn thẻ địa điểm (Bên trên ảnh) */}
              <View style={styles.locationBadgeWrapper}>
                <LocationJourneySelector
                  selectedTripId={selectedTripId}
                  onSelectTripId={(newTripId) => {
                    setSelectedTripId(newTripId); // Lưu ngầm xuống AsyncStorage cho lần sau
                  }}
                />
              </View>

              {/* Input Mô tả (Bên dưới ảnh) */}
              <Animated.View
                style={[styles.captionWrapper, animatedCaptionStyle]}
              >
                <CustomInput
                  placeholder="Viết gì đó"
                  value={caption}
                  onChangeText={setCaption}
                  style={styles.captionInput}
                />
              </Animated.View>
            </View>

            {/* Post Details & Map Toggle Option */}
            <View style={styles.detailsCard}>
              <View style={styles.optionRow}>
                <View style={styles.optionTextContainer}>
                  <View style={styles.labelWithIcon}>
                    <MaterialCommunityIcons
                      name="map-marker-path"
                      size={18}
                      color={Colors.primary}
                    />
                    <Text style={styles.optionTitle}>
                      Chia sẻ lên Bản đồ Bước chân
                    </Text>
                  </View>
                  {shareToMap ? (
                    isLocationLoading ? (
                      <View style={styles.locationLoadingRow}>
                        <ActivityIndicator
                          size="small"
                          color={Colors.primary}
                        />
                        <Text style={styles.optionSubtitle}>
                          Đang xác định vị trí...
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.optionSubtitle,
                          {
                            color: Colors.primary,
                            fontWeight: "600",
                            marginTop: 4,
                          },
                        ]}
                      >
                        📍 {location?.address || "Đã xác định tọa độ GPS"}
                      </Text>
                    )
                  ) : (
                    <Text
                      style={[
                        styles.optionSubtitle,
                        {
                          color: Colors.textMuted,
                          fontStyle: "italic",
                          marginTop: 4,
                        },
                      ]}
                    >
                      Vị trí sẽ không được lưu vào bài viết này
                    </Text>
                  )}
                </View>
                <Switch
                  value={shareToMap}
                  onValueChange={handleToggleShareToMap}
                  trackColor={{ false: "#3A3A3C", true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>
          </View>

          {/* Thông báo nổi cảnh báo ngay bên trong Modal */}
          {noticeMessage && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={styles.modalToast}
            >
              <Feather name="alert-circle" size={16} color={Colors.white} />
              <Text style={styles.modalToastText}>{noticeMessage}</Text>
            </Animated.View>
          )}

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleSavePhoto}
              style={[styles.actionButton, styles.retakeButton]}
            >
              <Feather name="download" size={18} color={Colors.white} />
              <Text style={styles.retakeText}>Lưu ảnh</Text>
            </Pressable>

            <Pressable
              onPress={handlePostPhoto}
              style={[
                styles.actionButton,
                styles.postButton,
                isUploading && { opacity: 0.7 },
              ]}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color={Colors.black} size="small" />
              ) : (
                <Feather name="send" size={18} color={Colors.black} />
              )}
              <Text style={styles.postText}>
                {isUploading ? "Đang tải..." : "Đăng ảnh"}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalToast: {
    position: "absolute",
    marginHorizontal: 30,
    bottom: 95,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(220, 53, 69, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 9999,
  },
  modalToastText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#0F1417",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
  },
  imageCardContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1E252B",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  locationBadgeWrapper: {
    position: "absolute",
    top: 16,
    left: 16,

    zIndex: 10,
  },
  captionWrapper: {
    position: "absolute",
    bottom: 0,
    left: 40, // Ép lùi vào từ 2 bên để căn giữa và thu nhỏ chiều rộng
    right: 40,
    zIndex: 10,
  },
  captionInput: {
    backgroundColor: Colors.glassDark,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    color: Colors.white,
    textAlign: "center",
    borderRadius: 40,
    height: 48, // Ép chiều cao giống nút (Pill shape)
  },
  detailsCard: {
    backgroundColor: "#1E252B",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  optionTextContainer: {
    flex: 1,
    gap: 4,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  optionTitle: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  optionSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 28,
  },
  retakeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  postButton: {
    backgroundColor: Colors.primary,
  },
  retakeText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  postText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: "700",
  },
  locationLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
});
