import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface CameraHeaderProps {
  onBackPress?: () => void;
  onGroupPress?: () => void;
  onSettingsPress?: () => void;
  selectedGroup?: string;
}

export const CameraHeader = ({
  onBackPress,
  onGroupPress,
  onSettingsPress,
  selectedGroup = 'Besties 💖',
}: CameraHeaderProps): React.JSX.Element => {
  return (
    <View style={styles.headerNav}>
      {/* Back Button */}
      <Pressable
        aria-label="Go back"
        onPress={onBackPress}
        style={({ pressed }) => [
          styles.iconButton,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
        ]}
      >
        <Feather name="chevron-left" size={24} color={Colors.primary} />
      </Pressable>

      {/* Group Selector */}
      <Pressable
        onPress={onGroupPress}
        style={({ pressed }) => [
          styles.groupSelector,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={styles.groupText}>{selectedGroup}</Text>
        <Feather name="chevron-down" size={16} color={Colors.primary} style={styles.groupChevron} />
      </Pressable>

      {/* Settings Button */}
      <Pressable
        aria-label="Settings"
        onPress={onSettingsPress}
        style={({ pressed }) => [
          styles.iconButton,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
        ]}
      >
        <Feather name="settings" size={22} color={Colors.primary} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 6,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  groupText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  groupChevron: {
    marginLeft: 6,
    opacity: 0.9,
  },
});
