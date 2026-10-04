import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AlertProvider } from "./src/components/AlertProvider";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedSplashScreen } from "./src/components/AnimatedSplashScreen";

export default function App(): React.JSX.Element {
  // Trạng thái kiểm soát màn hình chào động
  const [isSplashFinished, setIsSplashFinished] = useState<boolean>(false);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <AlertProvider>
            <StatusBar style="inverted" />
            <RootNavigator />
            {!isSplashFinished && (
              <AnimatedSplashScreen onFinish={() => setIsSplashFinished(true)} />
            )}
          </AlertProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
