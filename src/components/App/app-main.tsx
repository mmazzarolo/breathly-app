import React, { FC } from "react";
import { Appearance, View } from "react-native";
import { useAppContext } from "../../context/app-context";
import { useOnMount } from "../../hooks/use-on-mount";
import { AppRouter } from "./app-router";

// Initializes the app state and, once done, hides the splash screen and shows
// the AppRouter
export const AppMain: FC = () => {
  const { ready, initialize, setSystemColorScheme } = useAppContext();

  useOnMount(() => {
    initialize();
    Appearance.addChangeListener((data) => {
      setSystemColorScheme(data.colorScheme || "no-preference");
    });
  });

  if (!ready) {
    return <View />;
  } else {
    return <AppRouter />;
  }
};
