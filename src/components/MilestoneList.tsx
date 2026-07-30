import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export const MilestoneList = (): React.JSX.Element => {
  return (
    <View style={styles.section}>
      {/* Tiêu đề danh sách */}
      <View style={styles.header}>
        <Text style={styles.title}>Travel Milestones</Text>
        <Text style={styles.viewAll}>View All</Text>
      </View>
      
      {/* Danh sách cuộn ngang */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.badgeCard}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="landscape" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.badgeText}>Ha Giang Conqueror</Text>
        </View>
        
        <View style={styles.badgeCard}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="location-city" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.badgeText}>City Hopper</Text>
        </View>
        
        <View style={styles.badgeCard}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="nights-stay" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.badgeText}>Night Owl</Text>
        </View>
        
        <View style={styles.badgeCard}>
          <View style={styles.iconWrapper}>
            <MaterialIcons name="restaurant" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.badgeText}>Street Foodie</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  viewAll: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  badgeCard: {
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(112, 194, 180, 0.2)', // Màu nền mờ
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
});
