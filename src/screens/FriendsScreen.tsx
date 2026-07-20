import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export const FriendsScreen = (): React.JSX.Element => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="people-outline" size={72} color={Colors.primary} />
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>Danh sách bạn bè & Hoạt động nhóm du lịch</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
