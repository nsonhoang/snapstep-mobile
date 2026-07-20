import React from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ExploreSearchBarProps {
  searchQuery: string;
  onChangeSearch: (query: string) => void;
}

export const ExploreSearchBar = ({
  searchQuery,
  onChangeSearch,
}: ExploreSearchBarProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search locations (e.g., 'Da Lat', 'Ha Giang')"
        placeholderTextColor={Colors.textMuted}
        value={searchQuery}
        onChangeText={onChangeSearch}
      />
      <Pressable style={styles.searchIconContainer} hitSlop={8}>
        <Feather name="search" size={20} color={Colors.textMuted} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E252B',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchIconContainer: {
    marginLeft: 8,
  },
});
