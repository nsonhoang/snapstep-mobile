import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface CameraTogglesProps {
  isFlashOn: 'on' | 'off' | 'auto';
  isGhostModeOn: boolean;
  onToggleFlash: () => void;
  onFlipCamera: () => void;
  onToggleGhostMode: () => void;
}

export const CameraToggles = ({
  isFlashOn,
  isGhostModeOn,
  onToggleFlash,
  onFlipCamera,
  onToggleGhostMode,
}: CameraTogglesProps): React.JSX.Element => {
  return (
    <View style={styles.togglesContainer}>
      {/* Flash Toggle */}
      <Pressable
        aria-label="Toggle flash"
        onPress={onToggleFlash}
        style={({ pressed }) => [
          styles.toggleButton,
          isFlashOn !== 'off' && styles.activeToggleButton,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
        ]}
      >
        <MaterialCommunityIcons
          name={
            isFlashOn === 'on'
              ? 'flash'
              : isFlashOn === 'auto'
              ? 'flash-auto'
              : 'flash-off'
          }
          size={22}
          color={isFlashOn !== 'off' ? Colors.black : Colors.primary}
        />
      </Pressable>

      {/* Camera Switch */}
      <Pressable
        aria-label="Switch camera"
        onPress={onFlipCamera}
        style={({ pressed }) => [
          styles.toggleButton,
          pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
        ]}
      >
        <Feather name="refresh-cw" size={22} color={Colors.primary} />
      </Pressable>

      {/* Ghost Mode Toggle */}
      <Pressable
        aria-label="Toggle ghost mode"
        onPress={onToggleGhostMode}
        style={({ pressed }) => [
          styles.ghostTogglePill,
          isGhostModeOn && styles.ghostToggleActivePill,
          pressed && { opacity: 0.8 },
        ]}
      >
        <MaterialCommunityIcons
          name="ghost"
          size={20}
          color={isGhostModeOn ? Colors.black : Colors.primary}
        />
        <View
          style={[
            styles.ghostDot,
            { backgroundColor: isGhostModeOn ? Colors.black : Colors.primary },
          ]}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  togglesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  toggleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: Colors.primary,
  },
  ghostTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(112, 194, 180, 0.18)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(112, 194, 180, 0.3)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  ghostToggleActivePill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ghostDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
