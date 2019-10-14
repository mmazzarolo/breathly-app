import React, { FC } from "react";
import { View } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { useColorScheme, Appearance } from "react-native-appearance";
import { useAppContext } from "../../context/AppContext";
import { useOnMount } from "../../hooks/useOnMount";
import { useOnUpdate } from "../../hooks/useOnUpdate";
import { AppRouter } from "./AppRouter";

// Initializes the app state and, once done, hides the splash screen and shows
// the AppRouter
export const AppMain: FC = () => {
  const { ready, initialize, setSystemColorScheme } = useAppContext();

  useOnMount(() => {
    initialize();
    Appearance.addChangeListener((data: any) => {
      setSystemColorScheme(data.colorScheme);
    });
  });

  useOnUpdate(prevReady => {
    if (!prevReady && ready) {
      SplashScreen.hide();
    }
  }, ready);

  let colorScheme = useColorScheme();
  if (colorScheme === "dark") {
    // render some dark thing
  } else {
    // render some light thing
  }

  if (!ready) {
    return <View />;
  } else {
    return <AppRouter />;
  }
};
