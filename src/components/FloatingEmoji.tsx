import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

export interface FloatingItem {
  id: string;
  emoji: string;
  leftOffset: number;
}

interface FloatingEmojiProps {
  emoji: string;
  leftOffset: number;
  onComplete: () => void;
}

export const FloatingEmoji = ({
  emoji,
  leftOffset,
  onComplete,
}: FloatingEmojiProps): React.JSX.Element => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(
      1,
      { duration: 1200, easing: Easing.out(Easing.cubic) },
      (finished?: boolean) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }
    );
  }, [onComplete, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = progress.value * -220;
    const scale =
      progress.value < 0.2
        ? 0.3 + (progress.value / 0.2) * 1.2
        : 1.5 - ((progress.value - 0.2) / 0.8) * 0.6;
    const opacity =
      progress.value < 0.15
        ? progress.value / 0.15
        : 1 - (progress.value - 0.15) / 0.85;

    return {
      transform: [{ translateX: leftOffset }, { translateY }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.floatingEmojiItem, animatedStyle]}>
      <Text style={styles.floatingEmojiText}>{emoji}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingEmojiItem: {
    position: 'absolute',
    bottom: 40,
  },
  floatingEmojiText: {
    fontSize: 44,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
