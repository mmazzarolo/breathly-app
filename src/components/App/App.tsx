import React, { FC } from "react";
import { AppearanceProvider } from "react-native-appearance";
import { AppContextProvider } from "../../context/AppContext";
import { AppMain } from "./AppMain";
import { Platform, UIManager } from "react-native";

// Enable layout animations on Android so that we can animate views to their new
// positions when a layout change happens
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// App entry point used to wrap the core logic of the app with context providers
export const App: FC = () => {
  return (
    <AppContextProvider>
      <AppMain />
    </AppContextProvider>
  );
};
