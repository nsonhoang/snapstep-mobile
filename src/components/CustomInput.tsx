import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Spacing } from '../constants/Spacing';
import { Radius } from '../constants/Radius';
import { Typography } from '../constants/Typography';

export interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

/**
 * Component Input chuẩn Design System (SnapStep)
 * Sử dụng Design Tokens (Colors, Spacing, Radius, Typography) và đồng bộ viền xanh Mint khi focus.
 */
export const CustomInput = ({
  style,
  ...props
}: CustomInputProps): React.JSX.Element => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused, style]}
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        onFocus={(e) => {
          setIsFocused(true);
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (props.onBlur) props.onBlur(e);
        }}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: Typography.body.fontSize,
    borderWidth: 1,
    borderColor: Colors.outline,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(112, 194, 180, 0.06)',
  },
});
