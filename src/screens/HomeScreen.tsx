import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../navigation/AuthContext';
import { HomeScreenProps } from '../navigation/types';
import { Colors } from '../constants/Colors';
import { useAlert } from '../components/AlertProvider';

export const HomeScreen = ({ navigation }: HomeScreenProps): React.JSX.Element => {
  const { logout } = useAuth();
  const { showAlert } = useAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = (): void => {
    showAlert({
      title: 'Đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi SnapStep không?',
      type: 'warning',
      confirmText: 'Đăng xuất',
      cancelText: 'Hủy',
      onConfirm: logout,
    });
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Xin chào,</Text>
              <Text style={styles.userNameText}>Người dùng SnapStep</Text>
            </View>
            <Pressable 
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && { opacity: 0.7 }
              ]} 
              onPress={handleLogout}
            >
              <Feather name="log-out" size={16} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </Pressable>
          </View>

          {/* Dashboard Highlight Card */}
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainCard}
          >
            <Text style={styles.mainCardTitle}>Hôm nay bạn đã đi được</Text>
            <Text style={styles.mainCardValue}>10,482</Text>
            <Text style={styles.mainCardSubtitle}>bước chân / Mục tiêu 12,000</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '87%' }]} />
              </View>
              <Text style={styles.progressText}>87%</Text>
            </View>
          </LinearGradient>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Khoảng cách</Text>
              <Text style={styles.statValue}>7.6 km</Text>
            </View>
            <View style={[styles.statCard, { marginRight: 0 }]}>
              <Text style={styles.statLabel}>Calo tiêu thụ</Text>
              <Text style={styles.statValue}>452 kcal</Text>
            </View>
          </View>

          {/* History List Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nhật ký hành trình</Text>
          </View>

          <View style={styles.historyItem}>
            <View style={styles.historyTextContainer}>
              <Text style={styles.historyTitle}>Chạy bộ buổi sáng</Text>
              <Text style={styles.historyMeta}>Hôm nay • 06:30 AM</Text>
            </View>
            <Text style={styles.historyValue}>+6,200 bước</Text>
          </View>

          <View style={styles.historyItem}>
            <View style={styles.historyTextContainer}>
              <Text style={styles.historyTitle}>Đi bộ công viên</Text>
              <Text style={styles.historyMeta}>Hôm qua • 05:15 PM</Text>
            </View>
            <Text style={styles.historyValue}>+4,282 bước</Text>
          </View>

          {/* Route Info Badge */}
          <View style={styles.infoBadge}>
            <Text style={styles.infoBadgeText}>
              Đây là Route Private (Chỉ truy cập được sau khi đăng nhập)
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 20,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  mainCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  mainCardTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  mainCardValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    marginVertical: 8,
  },
  mainCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyTextContainer: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  historyMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  historyValue: {
    fontSize: 15,
    color: '#10B981',
    fontWeight: '700',
  },
  infoBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  infoBadgeText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
