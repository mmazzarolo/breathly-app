import * as Font from "expo-font";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { FC, useEffect } from "react";
import { Platform, UIManager, View, LayoutAnimation } from "react-native";
import { fonts as fontAssets } from "@breathly/assets/fonts";
import { Navigator } from "@breathly/core/navigator";
import { useHydration, useSettingsStore } from "@breathly/stores/settings";
import {
  initializeImmersiveMode,
  useStickyImmersiveReset,
} from "@breathly/utils/use-sticky-immersive-reset";
import { useThemedStatusBar } from "@breathly/utils/use-themed-status-bar";
import { SplashScreenManager } from "./splash-screen-manager";

// Enable layout animations on Android so that we can animate views to their new
// positions when a layout change happens
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

initializeImmersiveMode();

// App entry point used to wrap the core logic of the app with context providers
export const EntryPoint: FC = () => {
  return (
    <SplashScreenManager>
      <Main />
    </SplashScreenManager>
  );
};

// Initializes the app state and, once done, hides the splash screen and shows
// the AppRouter
const Main: FC = () => {
  const { setColorScheme } = useNativeWindColorScheme();
  const [areFontsLoaded] = Font.useFonts(fontAssets);
  const theme = useSettingsStore((state) => state.theme);
  const shouldFollowSystemDarkMode = useSettingsStore((state) => state.shouldFollowSystemDarkMode);
  const hydrated = useHydration();
  useStickyImmersiveReset();
  useThemedStatusBar();

  useEffect(() => {
    let unsubscribe;
    if (hydrated) {
      LayoutAnimation.easeInEaseOut();
      if (shouldFollowSystemDarkMode) {
        setColorScheme("system");
      } else if (theme === "dark") {
        setColorScheme("dark");
      } else {
        setColorScheme("light");
      }
    }
    return () => {
      unsubscribe?.();
    };
  }, [theme, shouldFollowSystemDarkMode, hydrated]);

  if (!hydrated || !areFontsLoaded) {
    return <View />;
  }

  return <Navigator />;
};
