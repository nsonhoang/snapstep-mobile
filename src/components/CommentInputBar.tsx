import React from 'react';
import { StyleSheet, View, TextInput, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface CommentInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  visible?: boolean;
}

export const CommentInputBar = ({
  value,
  onChangeText,
  onSubmit,
  visible = true,
}: CommentInputBarProps): React.JSX.Element | null => {
  if (!visible) return null;

  return (
    <View style={styles.seamlessInputContainer}>
      <View style={styles.inputFloatingPill}>
        <TextInput
          style={styles.textInput}
          placeholder="Share your feelings..."
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
        />
        <Pressable
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.sendBtn,
            pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
        >
          <Ionicons name="send" size={16} color={Colors.black} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  seamlessInputContainer: {
    width: '100%',
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 14 : 10,
    backgroundColor: Colors.transparent,
  },
  inputFloatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  textInput: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    paddingVertical: 8,
    paddingRight: 10,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
