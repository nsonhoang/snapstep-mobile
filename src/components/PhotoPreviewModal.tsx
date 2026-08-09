import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  Pressable,
  Switch,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";
import { LocationJourneySelector } from "./LocationJourneySelector";
import { CustomInput } from "./CustomInput";
import { useAlert } from "../components/AlertProvider";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useKeyboardHeight } from "../hooks/useKeyboardHeight";

export interface PhotoPreviewModalProps {
  visible: boolean;
  photoUri?: string;
  onClose: () => void;
  onRetake: () => void;
  onPost?: () => void;
}

export const PhotoPreviewModal = ({
  visible,
  photoUri,
  onClose,
  onRetake,
  onPost,
}: PhotoPreviewModalProps): React.JSX.Element => {
  const [shareToMap, setShareToMap] = useState<boolean>(true);
  const [selectedJourney, setSelectedJourney] = useState<string>(
    "Hà Giang, Việt Nam 🏔️",
  );
  const [caption, setCaption] = useState<string>("");

  const keyboardHeight = useKeyboardHeight();

  const animatedCaptionStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: keyboardHeight.value, // Dùng value của SharedValue
    };
  });

  const { showAlert } = useAlert();

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <SafeAreaView style={styles.modalContainer}>
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
                  selectedJourney={selectedJourney}
                  onSelectJourney={setSelectedJourney}
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
                    {/* nếu có vị trí thì bật lên  */}
                    <Text style={styles.optionTitle}>
                      Chia sẻ lên Bản đồ Bước chân
                    </Text>
                  </View>
                  <Text style={styles.optionSubtitle}>
                    Cho phép bạn bè khám phá địa điểm đẹp này của bạn
                  </Text>
                </View>
                <Switch
                  /* nếu có vị trí thì bật lên  */
                  value={shareToMap}
                  onValueChange={setShareToMap}
                  trackColor={{ false: "#3A3A3C", true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>
          </View>

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
              onPress={onPost || onClose}
              style={[styles.actionButton, styles.postButton]}
            >
              <Feather name="send" size={18} color={Colors.black} />
              <Text style={styles.postText}>Đăng ảnh</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
});
