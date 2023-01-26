import * as NavigationBar from "expo-navigation-bar";
import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

export const useThemedNavigationBar = ({
  lightBackgroundColor,
  darkBackgroundColor,
}: {
  lightBackgroundColor: string;
  darkBackgroundColor: string;
}) => {
  const appState = useRef(AppState.currentState);
  const { colorScheme, getColorScheme } = useColorScheme();

  const updateNavigationBarTheme = async (colorScheme?: "dark" | "light", transparent = true) => {
    if (Platform.OS === "android") {
      if (!colorScheme) colorScheme = getColorScheme();

      let backgroundColor = colorScheme === "light" ? lightBackgroundColor : darkBackgroundColor;
      // Setting the background color to `transparent` requires a workaround for now
      // https://github.com/expo/expo/issues/16036
      if (transparent) {
        backgroundColor = "rgba(0, 0, 0, 0.005)";
      }

      const buttonStyle = colorScheme === "light" ? "dark" : "light";

      return Promise.all([
        NavigationBar.setPositionAsync("absolute"),
        NavigationBar.setBackgroundColorAsync(backgroundColor),
        NavigationBar.setButtonStyleAsync(buttonStyle),
      ]);
    }
  };

  useEffect(() => {
    // When the app goes in the background the navbar loses its transparent effect.
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // 500 is just a magic number that seem to work most of the time — sadly you can still see
        // the naviation bar flash a bit sometimes when going from the background to the foreground :(
        setTimeout(updateNavigationBarTheme, 500);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    updateNavigationBarTheme();
  }, [colorScheme]);

  return {
    updateNavigationBarTheme,
  };
};
