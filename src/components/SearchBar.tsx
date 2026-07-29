import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, placeholder = 'Search...' }: SearchBarProps): React.JSX.Element => {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search" size={20} color={Colors.textMuted} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 15,
    height: '100%',
  },
});
