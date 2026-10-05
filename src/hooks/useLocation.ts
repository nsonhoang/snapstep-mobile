import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import { LocationSearchService } from "../services/locationSearchService";

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLocation = useCallback(async (): Promise<LocationData | null> => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Xin quyền truy cập vị trí
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        const deniedMsg =
          "Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt.";
        setErrorMsg(deniedMsg);
        setIsLoading(false);
        return null;
      }

      // 2. Lấy tọa độ hiện tại (Dùng Balanced để lấy nhanh và tiết kiệm pin)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Request timeout"));
        }, 8000);
      });
      const currentLocation = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        timeoutPromise,
      ]);

      // 3. Dịch tọa độ ngược ra tên địa chỉ (Reverse Geocoding)

      let addressText = "Vị trí không xác định";
      // Nếu Geocoder của hệ thống không lấy được địa chỉ cụ thể, kích hoạt fallback API (Photon/OSM)
      if (currentLocation !== null) {
        const apiAddress = await LocationSearchService.reverseGeocode(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
        );
        if (apiAddress) {
          addressText = apiAddress;
        }
      }

      console.log("Address:", addressText);

      // 4. Cập nhật state và trả về kết quả
      const locData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: addressText,
      };
      setLocation(locData);
      return locData;
    } catch (error) {
      console.error("Lỗi khi lấy vị trí:", error);
      setErrorMsg(
        "Không thể lấy được vị trí hiện tại. Vui lòng kiểm tra lại GPS hoặc kết nối mạng.",
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { location, errorMsg, isLoading, refetch: fetchLocation };
};
