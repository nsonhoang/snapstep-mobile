import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Xin quyền truy cập vị trí
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt.');
        setIsLoading(false);
        return;
      }

      // 2. Lấy tọa độ hiện tại (Dùng Balanced để lấy nhanh và tiết kiệm pin)
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // 3. Dịch tọa độ ngược ra tên địa chỉ (Reverse Geocoding)
      let addressText = 'Vị trí không xác định';
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          // Ghép tên thành phố và quốc gia
          addressText = [place.city || place.subregion, place.country]
            .filter(Boolean)
            .join(', ');
        }
      } catch (geocodeError) {
        console.warn('Lỗi khi dịch địa chỉ (Reverse Geocode):', geocodeError);
        // Vẫn tiếp tục chạy để lấy được tọa độ (Lat, Long)
      }
      console.log('Address:', currentLocation);

      // 4. Cập nhật state
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: addressText,
      });

    } catch (error) {
      console.error('Lỗi khi lấy vị trí:', error);
      setErrorMsg('Không thể lấy được vị trí hiện tại. Vui lòng kiểm tra lại GPS hoặc kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { location, errorMsg, isLoading, refetch: fetchLocation };
};
