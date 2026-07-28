import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_DEFAULT, Marker, Polygon } from 'react-native-maps';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { MAP_DARK_STYLE } from './MapScreen';
import { GroupLeaderboard } from '../components/GroupLeaderboard';
import vietnamGeoData from '../../assets/vn_provinces_simplified.json';

type ConquestScreenProps = NativeStackScreenProps<RootStackParamList, 'Conquest'>;



// Interface cho dữ liệu JSON đã tối ưu (format tùy chỉnh, không phải GeoJSON chuẩn)
interface SimplifiedCoord {
  la: number; // latitude
  lo: number; // longitude
}

interface SimplifiedFeature {
  n: string;  // Name_VI
  e: string;  // Name_EN
  r: SimplifiedCoord[][]; // Mảng các ring polygon đã chuyển đổi sẵn
}

// Dữ liệu polygon sẵn sàng render trên MapView
interface ProvincePolygonData {
  key: string;
  coordinates: { latitude: number; longitude: number }[];
  fillColor: string;
  strokeColor: string;
}

// Dữ liệu bảng xếp hạng nhóm (sau này sẽ lấy từ API)
const LEADERBOARD_DATA = [
  { rank: 1, username: '@Alex_W', score: 1450, emoji: '👨🏻‍💻', avatarColor: '#C2F0C2', badge: '👑' },
  { rank: 2, username: '@Sam_J', score: 1320, emoji: '👦🏽', avatarColor: '#FFE0B2', badge: '🥈' },
  { rank: 3, username: '@Mia_C', score: 1280, emoji: '👩🏻', avatarColor: '#F8BBD0', badge: '🥉' },
  { rank: 4, username: '@You', score: 980, emoji: '👨🏻', avatarColor: '#BBDEFB', isCurrentUser: true, globalRank: '15th' },
];

export const ConquestScreen = ({ navigation }: ConquestScreenProps): React.JSX.Element => {
  // Trạng thái map đã render xong hay chưa (dùng để hiện loading overlay)
  const [mapReady, setMapReady] = useState(false);

  const [ConqueredProvinces, setConqueredProvinces] = useState([
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Khánh Hòa"
  ]);

  // Hàm xử lý khi nhấn nút quay lại
  const handleGoBack = () => {
    navigation.goBack();
  };

  // Tính toán dữ liệu polygon bằng useMemo — chỉ chạy lại khi ConqueredProvinces thay đổi
  // Tọa độ đã được pre-compute sẵn trong JSON → chỉ cần map key ngắn sang key đầy đủ
  const polygonData = useMemo(() => {
    const features = (vietnamGeoData as any).features as SimplifiedFeature[];

    return features.flatMap((feature, featureIndex) => {
      // Kiểm tra tỉnh đã chinh phục chưa
      const isConquered = ConqueredProvinces.some(prov =>
        feature.n.includes(prov) || feature.e.includes(prov)
      );

      const fillColor = isConquered
        ? 'rgba(112, 194, 180, 0.4)'   // Màu Mint Green nổi bật
        : 'rgba(255, 255, 255, 0.025)'; // Màu tối mờ

      const strokeColor = isConquered
        ? Colors.primary                // Viền xanh Mint sáng
        : 'rgba(255, 255, 255, 0.08)';  // Viền trắng/xám mờ rất nhẹ

      // Tọa độ đã có sẵn format {la, lo} → chỉ cần map sang {latitude, longitude}
      return feature.r.map((ring, ringIndex) => ({
        key: `poly-${featureIndex}-${ringIndex}`,
        coordinates: ring.map(({ la, lo }) => ({ latitude: la, longitude: lo })),
        fillColor,
        strokeColor,
      }));
    }) as ProvincePolygonData[];
  }, [ConqueredProvinces]);
  const navigateToExploreScreenWithMe = () => {
    navigation.navigate('MainTabs', {
      screen: 'Explore',
      params: {
        filter: 'me',
      },
    });
  };
  const navigateTripScreen = () => {
    console.log('Trip screen');
  }

  return (
    <SafeAreaView style={styles.container}>
   

      {/* Header điều hướng */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton} 
          onPress={handleGoBack}
          android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
        >
          <Ionicons name="chevron-back" size={28} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Conquest Dashboard</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bản đồ Việt Nam sử dụng MapView (Không cần dùng react-native-svg) */}
        <View style={styles.mapContainer}>
          {/* MapView render ngầm phía dưới overlay — khi onMapReady kích hoạt, ẩn overlay */}
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            customMapStyle={MAP_DARK_STYLE}
            userInterfaceStyle="dark"
            onMapReady={() => setMapReady(true)}
            initialRegion={{
              latitude: 16.2000, // Tọa độ trung tâm Việt Nam để hiển thị bao quát
              longitude: 108.2000,
              latitudeDelta: 10.5,
              longitudeDelta: 10.5,
            }}
          >
            {/* Vẽ toàn bộ các tỉnh thành từ dữ liệu GeoJSON đã tối ưu */}
            {polygonData.map((poly) => (
              <Polygon
                key={poly.key}
                coordinates={poly.coordinates}
                fillColor={poly.fillColor}
                strokeColor={poly.strokeColor}
                strokeWidth={0.8}
                tappable={true}
              />
            ))}
          </MapView>
        </View>

        {/* Lưới thông tin thống kê 2x2 */}
        <View style={styles.statsGrid}>
          {/* Card 1: Số tỉnh thành đã qua */}
          <Pressable
            style={({ pressed }) => [
              styles.statsCard,
              pressed && { opacity: 0.7 },
            ]}
            onPress={navigateTripScreen}
            android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
          >
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsLabel}>Provinces Visited</Text>
              <Text style={styles.statsValue}>
                {ConqueredProvinces.length} <Text style={styles.statsValueTotal}>/ 63</Text>
              </Text>
            </View>
            <View style={styles.statsIconBox}>
              <Text style={styles.statsEmoji}>🗺️</Text>
            </View>
          </Pressable>
          {/* Card 2: Thứ hạng khám phá */}
          <View style={styles.statsCard}>
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsLabel}>Travel Rank</Text>
              <Text style={styles.statsValueSmall}>Bronze Explorer</Text>
            </View>
            <View style={styles.statsIconBox}>
              <Text style={styles.statsEmoji}>🥉</Text>
            </View>
          </View>

          {/* Card 3: Tổng ảnh đã chụp — nhấn để xem danh sách ảnh */}
          <Pressable
            style={({ pressed }) => [
              styles.statsCard,
              pressed && { opacity: 0.7 },
            ]}
            onPress={navigateToExploreScreenWithMe}
            android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
          >
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsLabel}>Total Photos</Text>
              <Text style={styles.statsValue}>248</Text>
            </View>
            <View style={styles.statsIconBox}>
              <Text style={styles.statsEmoji}>📸</Text>
            </View>
          </Pressable>

          {/* Card 4: Chuỗi ngày liên tục */}
          <View style={styles.statsCard}>
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsLabel}>Longest Streak</Text>
              <Text style={styles.statsValue}>7 Days</Text>
            </View>
            <View style={styles.statsIconBox}>
              <Text style={styles.statsEmoji}>🔥</Text>
            </View>
          </View>
        </View>

        {/* Bảng xếp hạng nhóm */}
        <GroupLeaderboard players={LEADERBOARD_DATA} />
      </ScrollView>

      {/* Loading overlay phủ toàn màn hình — ẩn khi map đã sẵn sàng */}
      {!mapReady && (
        <View style={styles.fullScreenLoading}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.mapLoadingText}>Đang tải bản đồ...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background, // Chuẩn tối đen theo AGENTS.md
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mapContainer: {
    width: '100%',
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  markerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 29, 33, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  mapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  cityText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    width: (Value.widthScreen - 52) / 2, // Đảm bảo căn chỉnh vừa khớp kích thước màn hình theo Value
    backgroundColor: '#1C1D21',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statsTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  statsLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statsValue: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  statsValueTotal: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '400',
  },
  statsValueSmall: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  statsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#121316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsEmoji: {
    fontSize: 18,
  },
  fullScreenLoading: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.background, // Nền đen đặc che toàn bộ nội dung phía dưới
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100, // Đảm bảo nằm trên tất cả
    gap: 8,
  },
  mapLoadingText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
