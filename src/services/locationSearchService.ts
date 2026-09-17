export interface PlaceSuggestion {
  id: string;
  title: string;
  subtitle: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
}

interface PhotonFeature {
  properties: {
    osm_id?: number;
    name?: string;
    street?: string;
    housenumber?: string;
    locality?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number]; // [kinh độ, vĩ độ]
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

/**
 * Định dạng địa chỉ chuẩn theo quy cách Việt Nam:
 * [Tên đường / Địa danh], [Phường / Xã], [Quận / Huyện], [Tỉnh / Thành phố]
 */
const formatAddress = (props: PhotonFeature["properties"]): string => {
  const districtPart = props.district || "";
  const cityPart = props.city || props.state || "";

  const parts = [districtPart, cityPart].filter(
    (item, index, arr) => item && arr.indexOf(item) === index,
  );

  return parts.join(", ");
};

/**
 * Dịch vụ tìm kiếm địa điểm và dịch ngược tọa độ GPS độc lập (Photon / OpenStreetMap)
 * Hoàn toàn miễn phí, không yêu cầu API key và hoạt động ổn định trên cả Android & iOS.
 */
export const LocationSearchService = {
  /**
   * Tìm kiếm gợi ý địa điểm theo từ khóa (có hỗ trợ AbortSignal để hủy request cũ)
   */
  searchPlaces: async (
    query: string,
    signal?: AbortSignal,
  ): Promise<PlaceSuggestion[]> => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return [];

    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lang=default&limit=5`;
      const response = await fetch(url, { signal });
      if (!response.ok) return [];

      const data: PhotonResponse = await response.json();
      if (!data.features || data.features.length === 0) return [];

      return data.features.map((f, idx) => {
        const p = f.properties;
        const [lon, lat] = f.geometry.coordinates;
        const formatted = formatAddress(p);
        const name = p.name || p.street || "Địa điểm";
        const subtitle = [p.district, p.city || p.state, p.country]
          .filter(Boolean)
          .join(", ");

        return {
          id: `${p.osm_id || idx}_${lat}_${lon}`,
          title: name,
          subtitle: subtitle || formatted,
          fullAddress: formatted || name,
          latitude: lat,
          longitude: lon,
        };
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        return [];
      }
      console.warn("Lỗi tìm kiếm địa điểm (LocationSearchService):", error);
      return [];
    }
  },

  /**
   * Dịch ngược tọa độ GPS thành địa chỉ tiếng Việt cụ thể (Đường, Phường, Quận, TP)
   */
  reverseGeocode: async (
    latitude: number,
    longitude: number,
  ): Promise<string | null> => {
    try {
      const url = `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`;
      const response = await fetch(url);
      if (!response.ok) return null;

      const data: PhotonResponse = await response.json();
      if (!data.features || data.features.length === 0) return null;

      const p = data.features[0].properties;
      const formatted = formatAddress(p);
      return formatted || null;
    } catch (error) {
      console.warn("Lỗi dịch ngược tọa độ (LocationSearchService):", error);
      return null;
    }
  },
};
