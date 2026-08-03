import { useEffect } from 'react';
import { Keyboard, KeyboardEvent, KeyboardEventName, Platform } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export const useKeyboardHeight = () => {
  const keyboardHeight = useSharedValue(0);

  useEffect(() => {
    const showEvent: KeyboardEventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent: KeyboardEventName = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e: KeyboardEvent) => {
      keyboardHeight.value = withTiming(e.endCoordinates.height, { duration: 250 });
    };

    const onKeyboardHide = () => {
      keyboardHeight.value = withTiming(0, { duration: 250 });
    };

    const showSubscription = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardHeight]);

  return keyboardHeight;
};
