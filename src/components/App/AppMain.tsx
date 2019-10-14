import React, { FC } from "react";
import { View } from "react-native";
import SplashScreen from "react-native-splash-screen";
import { useAppContext } from "../../context/AppContext";
import { useOnMount } from "../../hooks/useOnMount";
import { useOnUpdate } from "../../hooks/useOnUpdate";
import { AppRouter } from "./AppRouter";

// Initializes the app state and, once done, hides the splash screen and shows
// the AppRouter
export const AppMain: FC = () => {
  const { ready, initialize } = useAppContext();

  useOnMount(() => {
    initialize();
  });

  useOnUpdate(prevReady => {
    if (!prevReady && ready) {
      SplashScreen.hide();
    }
  }, ready);

  if (!ready) {
    return <View />;
  } else {
    return <AppRouter />;
  }
};
