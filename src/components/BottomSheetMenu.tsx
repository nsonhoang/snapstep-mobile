import React, { forwardRef, useCallback } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Colors } from "../constants/Colors";
import { Feather } from "@expo/vector-icons";

export interface BottomSheetOption {
  id: string;
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  isDestructive?: boolean;
  onPress: () => void;
}

interface BottomSheetMenuProps {
  options: BottomSheetOption[];
  title?: string;
  onClose?: () => void;
}

export const BottomSheetMenu = forwardRef<
  BottomSheetModal,
  BottomSheetMenuProps
>(({ options, title, onClose }, ref) => {
  // Tạo mờ phông nền với backdrop custom
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.8}
      />
    ),
    [],
  );

  const handleOptionPress = (onPress: () => void) => {
    // Ẩn Bottom Sheet
    if (ref && "current" in ref && ref.current) {
      ref.current.dismiss();
    }

    // Delay một chút cho animation đóng chạy mượt trước khi xử lý logic (để tránh lag)
    setTimeout(() => {
      onPress();
    }, 300);
  };

  return (
    <BottomSheetModal
      ref={ref}
      enablePanDownToClose={true}
      enableDynamicSizing={true}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.backgroundStyle}
      handleIndicatorStyle={styles.handleIndicator}
      onDismiss={onClose}
    >
      <BottomSheetView style={styles.contentContainer}>
        {title && <Text style={styles.title}>{title}</Text>}

        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.optionButton,
                pressed && styles.optionButtonPressed,
                index === options.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => handleOptionPress(option.onPress)}
            >
              <View
                style={[
                  styles.iconWrapper,
                  option.isDestructive && styles.iconWrapperDestructive,
                ]}
              >
                <Feather
                  name={option.iconName}
                  size={20}
                  color={option.isDestructive ? Colors.error : Colors.white}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  option.isDestructive && styles.optionLabelDestructive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: Colors.surface, // Đồng bộ màu surface
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: Colors.textMuted,
    width: 40,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32, // Padding vùng dưới (safe area)
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  optionsContainer: {
    backgroundColor: Colors.surfaceBright,
    borderRadius: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  optionButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconWrapperDestructive: {
    backgroundColor: "rgba(255, 180, 171, 0.15)", // Mô phỏng opacity 0.15 của màu error (#FFB4AB)
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.white,
  },
  optionLabelDestructive: {
    color: Colors.error,
  },
});
