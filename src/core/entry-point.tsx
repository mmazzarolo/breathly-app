import * as Font from "expo-font";
import React, { FC, useEffect } from "react";
import { Appearance, Platform, UIManager, View, LayoutAnimation } from "react-native";
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
  const [areFontsLoaded, fontLoadError] = Font.useFonts(fontAssets);
  const theme = useSettingsStore((state) => state.theme);
  const shouldFollowSystemDarkMode = useSettingsStore((state) => state.shouldFollowSystemDarkMode);
  const shouldKeepNavigationBarVisible = useSettingsStore(
    (state) => state.shouldKeepNavigationBarVisible,
  );
  const hydrated = useHydration();
  useStickyImmersiveReset(shouldKeepNavigationBarVisible);
  useThemedStatusBar();

  // Native views take their colours from the system appearance, not from the app's own
  // theme: the iOS large title and the picker wheel are UIKit, and they stayed in light mode
  // when the user turned "Use system theme" off and chose Dark — a dark title on a dark
  // background. Overriding the app's appearance is what makes every native view follow the
  // chosen theme, rather than patching each one by hand. "unspecified" hands control back to
  // the system. It changes the app's appearance only, never the system's.
  useEffect(() => {
    if (!hydrated) return;
    Appearance.setColorScheme(shouldFollowSystemDarkMode ? "unspecified" : theme);
  }, [hydrated, shouldFollowSystemDarkMode, theme]);

  // Animate the layout when the stored theme arrives, and on every later change.
  // The color scheme itself now comes from the settings store, through
  // `useColorScheme`, so there is nothing to push into a styling library.
  useEffect(() => {
    if (hydrated) {
      LayoutAnimation.easeInEaseOut();
    }
  }, [hydrated, shouldFollowSystemDarkMode, theme]);

  // `useFonts` keeps `loaded` false for ever once a load fails, so waiting on it alone would
  // hold the app on an empty view with no way out. A missing typeface only costs the custom
  // face; carry on with the system one.
  if (!hydrated || (!areFontsLoaded && !fontLoadError)) {
    return <View />;
  }

  return <Navigator />;
};
