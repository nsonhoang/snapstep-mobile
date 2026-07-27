import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { PROVIDER_DEFAULT, Marker, Polygon } from 'react-native-maps';
import { Colors } from '../constants/Colors';
import { Value } from '../constants/Value';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { MAP_DARK_STYLE } from './MapScreen';
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

export const ConquestScreen = ({ navigation }: ConquestScreenProps): React.JSX.Element => {
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
          <MapView
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            customMapStyle={MAP_DARK_STYLE}
            userInterfaceStyle="dark"
        
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
          <View style={styles.statsCard}>
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsLabel}>Provinces Visited</Text>
              <Text style={styles.statsValue}>
                12 <Text style={styles.statsValueTotal}>/ 63</Text>
              </Text>
            </View>
            <View style={styles.statsIconBox}>
              <Text style={styles.statsEmoji}>🗺️</Text>
            </View>
          </View>

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

          {/* Card 3: Tổng ảnh đã chụp */}
          <View style={styles.statsCard}>
            <View style={styles.statsTextContainer}>
              <Text style={styles.statsLabel}>Total Photos</Text>
              <Text style={styles.statsValue}>248</Text>
            </View>
            <View style={styles.statsIconBox}>
              <Text style={styles.statsEmoji}>📸</Text>
            </View>
          </View>

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

        {/* Bảng xếp hạng nhóm (Group Leaderboard) */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>Group Leaderboard</Text>

          <View style={styles.leaderboardList}>
            {/* Rank 1: @Alex_W */}
            <View style={styles.leaderboardItem}>
              <View style={styles.playerInfo}>
                <Text style={styles.rankText}>1.</Text>
                <View style={[styles.avatarContainer, { backgroundColor: '#C2F0C2' }]}>
                  <Text style={styles.avatarEmoji}>👨🏻‍💻</Text>
                </View>
                <Text style={styles.playerName}>@Alex_W</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>1450 pts</Text>
                <Text style={styles.badgeEmoji}>👑</Text>
              </View>
            </View>

            {/* Rank 2: @Sam_J */}
            <View style={styles.leaderboardItem}>
              <View style={styles.playerInfo}>
                <Text style={styles.rankText}>2.</Text>
                <View style={[styles.avatarContainer, { backgroundColor: '#FFE0B2' }]}>
                  <Text style={styles.avatarEmoji}>👦🏽</Text>
                </View>
                <Text style={styles.playerName}>@Sam_J</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>1320 pts</Text>
                <Text style={styles.badgeEmoji}>🥈</Text>
              </View>
            </View>

            {/* Rank 3: @Mia_C */}
            <View style={styles.leaderboardItem}>
              <View style={styles.playerInfo}>
                <Text style={styles.rankText}>3.</Text>
                <View style={[styles.avatarContainer, { backgroundColor: '#F8BBD0' }]}>
                  <Text style={styles.avatarEmoji}>👩🏻</Text>
                </View>
                <Text style={styles.playerName}>@Mia_C</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>1280 pts</Text>
                <Text style={styles.badgeEmoji}>🥉</Text>
              </View>
            </View>

            {/* Rank 4: @You (Người dùng hiện tại - Highlighted) */}
            <View style={[styles.leaderboardItem, styles.currentUserItem]}>
              <View style={styles.playerInfo}>
                <Text style={[styles.rankText, { color: Colors.primary }]}>4.</Text>
                <View style={[styles.avatarContainer, styles.currentUserAvatar]}>
                  <Text style={styles.avatarEmoji}>👨🏻</Text>
                </View>
                <Text style={[styles.playerName, { fontWeight: '700' }]}>
                  @You <Text style={styles.playerRankSub}>(15th)</Text>
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreText, { color: Colors.primary, fontWeight: '700' }]}>980 pts</Text>
                <View style={styles.badgeEmojiPlaceholder} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
  leaderboardCard: {
    backgroundColor: '#1C1D21',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  leaderboardTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  leaderboardList: {
    gap: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
    width: 16,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  playerName: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '500',
  },
  playerRankSub: {
    color: '#6B7280',
    fontWeight: '400',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreText: {
    color: Colors.text,
    fontSize: 15,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  badgeEmojiPlaceholder: {
    width: 22,
  },
  currentUserItem: {
    backgroundColor: 'rgba(112, 194, 180, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(112, 194, 180, 0.3)',
  },
  currentUserAvatar: {
    backgroundColor: '#BBDEFB',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28, 29, 33, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mapLoadingText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
