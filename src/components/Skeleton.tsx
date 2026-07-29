import React, { useEffect } from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

interface SkeletonProps {
  style?: ViewStyle | ViewStyle[];
}

export const Skeleton = ({ style }: SkeletonProps): React.JSX.Element => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 700 }),
        withTiming(0.3, { duration: 700 })
      ),
      -1, // infinite loop
      true // reverse on loop back
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return <Animated.View style={[styles.skeleton, style, animatedStyle]} />;
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
});
