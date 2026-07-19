import React from 'react';
import { StyleSheet, Text, Pressable, PressableProps, ActivityIndicator, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CustomButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const CustomButton = ({ title, loading = false, style, ...props }: CustomButtonProps): React.JSX.Element => {
  return (
    <Pressable
      disabled={loading || props.disabled}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { opacity: 0.85 },
        style,
      ]}
      {...props}
    >
      <LinearGradient
        colors={['#6366F1', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
