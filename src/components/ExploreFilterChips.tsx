import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Image } from 'react-native';
import { Colors } from '../constants/Colors';

export interface FilterChipItem {
  id: string;
  label: string;
  avatar?: string;
}

interface ExploreFilterChipsProps {
  chips: FilterChipItem[];
  selectedChipId: string;
  onSelectChip: (id: string) => void;
}

export const ExploreFilterChips = ({
  chips,
  selectedChipId,
  onSelectChip,
}: ExploreFilterChipsProps): React.JSX.Element => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const isSelected = chip.id === selectedChipId;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onSelectChip(chip.id)}
            style={({ pressed }) => [
              styles.chip,
              isSelected ? styles.chipSelected : styles.chipUnselected,
              pressed && { opacity: 0.8 },
            ]}
          >
            {chip.avatar && (
              <Image source={{ uri: chip.avatar }} style={styles.avatar} />
            )}
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  chipSelected: {
    backgroundColor: 'rgba(112, 194, 180, 0.15)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  chipUnselected: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
