import React, { FC } from "react";
import { Platform, UIManager } from "react-native";
import { AppContextProvider } from "../../context/app-context";
import { AppMain } from "./app-main";
import { SplashScreenManager } from "./splash-screen-manager";

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
    <SplashScreenManager>
      <AppContextProvider>
        <AppMain />
      </AppContextProvider>
    </SplashScreenManager>
  );
};
