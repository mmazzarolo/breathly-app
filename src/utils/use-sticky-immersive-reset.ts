// See:
// https://github.com/expo/fyi/blob/main/android-navigation-bar-visible-deprecated.md
// - immersive results in the navigation bar being hidden until the user swipes up from the edge
//   where the navigation bar is hidden.
// - sticky-immersive is identical to 'immersive' except that the navigation bar will be
//   semi-transparent and will be hidden again after a short period of time.
// Here we'll use the sticky-immersive mode
import * as NavigationBar from "expo-navigation-bar";
import { setStatusBarHidden, setStatusBarTranslucent } from "expo-status-bar";
import ms from "ms";
import { useEffect } from "react";

export function initializeImmersiveMode() {
  NavigationBar.setPositionAsync("absolute");
  NavigationBar.setVisibilityAsync("hidden");
  NavigationBar.setBehaviorAsync("overlay-swipe");
  NavigationBar.setBackgroundColorAsync("#ffffff00");
  setStatusBarHidden(true, "none");
  setStatusBarTranslucent(true);
}

// Hide the navigation bar after a certain duration
const HIDE_NAVIGATION_BAR_AFTER_MS = ms("3 sec");

export function useStickyImmersiveReset() {
  const visibility = NavigationBar.useVisibility();

  useEffect(() => {
    if (visibility === "visible") {
      const interval = setTimeout(() => {
        NavigationBar.setVisibilityAsync("hidden");
        setStatusBarHidden(true, "none");
      }, HIDE_NAVIGATION_BAR_AFTER_MS);

      return () => {
        clearTimeout(interval);
      };
    }
  }, [visibility]);
}
