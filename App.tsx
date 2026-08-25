import { GestureHandlerRootView } from "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { AlertProvider } from "./src/components/AlertProvider";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AlertProvider>
          <StatusBar style="inverted" />
          <RootNavigator />
        </AlertProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
