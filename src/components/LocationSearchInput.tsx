import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import { Radius } from '../constants/Radius';
import { Typography } from '../constants/Typography';
import { useLocation } from '../hooks/useLocation';
import { useDebounce } from '../hooks/useDebounce';
import {
  LocationSearchService,
  PlaceSuggestion,
} from '../services/locationSearchService';
import { useAlert } from './AlertProvider';

export interface LocationSearchInputProps {
  value: string;
  onChangeLocation: (location: string) => void;
  label?: string;
  placeholder?: string;
}

/**
 * Component nhập địa điểm thông minh chuẩn Design System
 * Tích hợp tìm kiếm gợi ý thời gian thực (Autocomplete), chống rate limit (Debounce 400ms),
 * và nút lấy GPS tức thì với cơ chế dịch ngược tọa độ chuẩn hành chính Việt Nam.
 */
export const LocationSearchInput = ({
  value,
  onChangeLocation,
  label = 'Địa điểm',
  placeholder = 'VD: Sa Pa, Lào Cai',
}: LocationSearchInputProps): React.JSX.Element => {
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const { showAlert } = useAlert();
  const {
    location: gpsLocationData,
    errorMsg: locationErrorMsg,
    isLoading: isLocationLoading,
    refetch: refetchLocation,
  } = useLocation();

  // Debounce từ khóa tìm kiếm 400ms chống spam gọi API
  const debouncedLocation = useDebounce(value, 400);

  useEffect(() => {
    const trimmed = debouncedLocation.trim();
    if (!trimmed || trimmed.length < 2 || !showSuggestions) {
      setPlaceSuggestions([]);
      setIsSearchingPlaces(false);
      return;
    }

    const controller = new AbortController();
    setIsSearchingPlaces(true);

    LocationSearchService.searchPlaces(trimmed, controller.signal)
      .then((results) => {
        setPlaceSuggestions(results);
      })
      .catch(() => {
        // Bỏ qua lỗi khi request bị hủy
      })
      .finally(() => {
        setIsSearchingPlaces(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedLocation, showSuggestions]);

  const handleSelectPlace = (place: PlaceSuggestion) => {
    onChangeLocation(place.fullAddress);
    setShowSuggestions(false);
    setPlaceSuggestions([]);
  };

  const handleClearLocation = () => {
    onChangeLocation('');
    setShowSuggestions(false);
    setPlaceSuggestions([]);
  };

  const handleUseCurrentLocation = async () => {
    setShowSuggestions(false);
    setPlaceSuggestions([]);

    if (
      gpsLocationData?.address &&
      gpsLocationData.address !== 'Vị trí không xác định'
    ) {
      onChangeLocation(gpsLocationData.address);
      return;
    }

    const loc = await refetchLocation();
    if (loc?.address && loc.address !== 'Vị trí không xác định') {
      onChangeLocation(loc.address);
    } else if (locationErrorMsg) {
      showAlert({
        title: 'Quyền vị trí',
        message: locationErrorMsg,
        type: 'warning',
      });
    } else {
      showAlert({
        title: 'Thông báo',
        message: 'Không thể xác định địa chỉ cụ thể từ GPS.',
        type: 'info',
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Tiêu đề & Nút GPS */}
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          style={styles.gpsButton}
          onPress={handleUseCurrentLocation}
          disabled={isLocationLoading}
          hitSlop={8}
        >
          {isLocationLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <MaterialIcons name="my-location" size={14} color={Colors.primary} />
              <Text style={styles.gpsButtonText}>Vị trí hiện tại</Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Ô nhập liệu địa điểm */}
      <View style={styles.inputContainer}>
        <MaterialIcons
          name="location-on"
          size={20}
          color={Colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { paddingLeft: 42, paddingRight: 40 }]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={(text) => {
            onChangeLocation(text);
            setShowSuggestions(true);
          }}
        />
        {value.trim() !== '' && (
          <Pressable
            style={styles.clearBtn}
            onPress={handleClearLocation}
            hitSlop={8}
          >
            <MaterialIcons name="close" size={16} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Danh sách gợi ý thời gian thực */}
      {showSuggestions && (isSearchingPlaces || placeSuggestions.length > 0) && (
        <View style={styles.suggestionsBox}>
          {isSearchingPlaces && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Đang tìm kiếm gợi ý địa điểm...</Text>
            </View>
          )}
          {placeSuggestions.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.suggestionItem,
                pressed && styles.suggestionItemPressed,
              ]}
              onPress={() => handleSelectPlace(item)}
            >
              <View style={styles.suggestionIconWrapper}>
                <MaterialIcons name="place" size={18} color={Colors.primary} />
              </View>
              <View style={styles.suggestionTextWrapper}>
                <Text style={styles.suggestionTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.suggestionSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  label: {
    color: Colors.text,
    fontSize: Typography.subhead.fontSize,
    fontWeight: '600',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(112, 194, 180, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(112, 194, 180, 0.25)',
  },
  gpsButtonText: {
    color: Colors.primary,
    fontSize: Typography.caption.fontSize,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  input: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    borderRadius: Radius.md,
    padding: 14,
    fontSize: Typography.body.fontSize,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  suggestionsBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.outline,
    overflow: 'hidden',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: Spacing.md,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: Typography.footnote.fontSize,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  suggestionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(112, 194, 180, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  suggestionTextWrapper: {
    flex: 1,
  },
  suggestionTitle: {
    color: Colors.white,
    fontSize: Typography.subhead.fontSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.caption.fontSize,
  },
});
