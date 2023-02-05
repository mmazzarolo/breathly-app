import * as Font from "expo-font";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import React, { FC, useEffect } from "react";
import { Platform, UIManager, View, LayoutAnimation } from "react-native";
import { fonts as fontAssets } from "@breathly/assets/fonts";
import { Navigator } from "@breathly/core/navigator";
import { colors } from "@breathly/design/colors";
import { useHydration, useSettingsStore } from "@breathly/stores/settings";
import { useThemedNavigationBar } from "@breathly/utils/use-themed-navigation-bar";
import { useThemedStatusBar } from "@breathly/utils/use-themed-status-bar";
import { SplashScreenManager } from "./splash-screen-manager";

// Enable layout animations on Android so that we can animate views to their new
// positions when a layout change happens
if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

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

  const { updateNavigationBarTheme } = useThemedNavigationBar({
    lightBackgroundColor: colors["stone-100"],
    darkBackgroundColor: colors["slate-900"],
  });
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

  return (
    <Navigator
      onStateChange={(state) => {
        // In the settings screen we want to show a solid navigation bar
        if (state.routes[state.index].name === "Settings") {
          updateNavigationBarTheme(null, false);
        } else {
          updateNavigationBarTheme(null, true);
        }
      }}
    />
  );
};
