// See:
// https://github.com/expo/fyi/blob/main/android-navigation-bar-visible-deprecated.md
// - immersive results in the navigation bar being hidden until the user swipes up from the edge
//   where the navigation bar is hidden.
// - sticky-immersive is identical to 'immersive' except that the navigation bar will be
//   semi-transparent and will be hidden again after a short period of time.
// Here we'll use the sticky-immersive mode
import { NavigationBar, useVisibility } from "expo-navigation-bar";
import { setStatusBarHidden } from "expo-status-bar";
import ms from "ms";
import { useEffect } from "react";
import { Platform, StatusBar } from "react-native";

export function initializeImmersiveMode() {
  if (Platform.OS !== "android") return;
  NavigationBar.setHidden(true);
  setStatusBarHidden(true, "none");
  StatusBar.setTranslucent(true);
}

// Hide the navigation bar after a certain duration
const HIDE_NAVIGATION_BAR_AFTER_MS = ms("3 sec");

export function useStickyImmersiveReset() {
  const visibility = useVisibility();

  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (visibility === "visible") {
      const interval = setTimeout(() => {
        NavigationBar.setHidden(true);
        setStatusBarHidden(true, "none");
      }, HIDE_NAVIGATION_BAR_AFTER_MS);

      return () => {
        clearTimeout(interval);
      };
    }
  }, [visibility]);
}
