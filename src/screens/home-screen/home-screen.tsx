import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";
import React, { FC, useEffect } from "react";
import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { create } from "zustand";
import { Pressable } from "@breathly/common/pressable";
import { RootStackParamList } from "@breathly/core/navigator";
import { colors } from "@breathly/design/colors";
import { PlanetsBackground } from "@breathly/screens/home-screen/planets-background";
import { StarsBackground } from "@breathly/screens/home-screen/stars-background";

export const useHomeScreenStatusStore = create<{
  isHomeScreenReady: boolean;
  markHomeScreenAsReady: () => unknown;
}>((set) => ({
  isHomeScreenReady: false,
  markHomeScreenAsReady: () => set(() => ({ isHomeScreenReady: true })),
}));

export const HomeScreen: FC<NativeStackScreenProps<RootStackParamList, "Home">> = ({
  navigation,
}) => {
  const { colorScheme } = useColorScheme();
  const { isHomeScreenReady, markHomeScreenAsReady } = useHomeScreenStatusStore();
  const insets = useSafeAreaInsets();
  const handleStartButtonPress = () => {
    navigation.navigate("Exercise");
  };
  const handleCustomizeButtonPress = () => {
    navigation.navigate("Settings");
  };

  // To avoid weird flashes we store a flag to track if the home screen has been fully rendered.
  // This flag is used to tell to `SplashScreenManager` when to hide the splash screen.
  useEffect(() => {
    // We run this only in light mode, because for dark mode we'll mark the flag only after
    // the stars background has been loaded.
    if (colorScheme === "light" && !isHomeScreenReady) {
      markHomeScreenAsReady();
    }
  }, []);

  const handleStarsBackgroundImageLoaded = () => {
    if (!isHomeScreenReady) {
      markHomeScreenAsReady();
    }
  };

  return (
    <Animated.View
      className="flex-1 items-center justify-between"
      style={{
        // Paddings to handle safe area
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {colorScheme === "dark" && (
        <StarsBackground onImageLoaded={handleStarsBackgroundImageLoaded} />
      )}
      {colorScheme === "light" && <PlanetsBackground />}

      <View className="mx-12 flex-1 items-center justify-end">
        <Animated.Text className="font-breathly-serif-semibold text-5xl text-slate-800 dark:text-white">
          Breathly
        </Animated.Text>
        <Animated.Text className="mb-8 text-center font-breathly-regular text-lg font-light text-slate-500">
          Relax, focus on your breath, and find your inner peace.
        </Animated.Text>
      </View>
      <Pressable
        className="w-72 max-w-xs items-center rounded-lg px-8 py-2 text-center"
        style={{ backgroundColor: colors.pastel["orange-light"] }}
        onPress={handleStartButtonPress}
      >
        <Text className="py-1 text-lg text-slate-800">Start a new session</Text>
      </Pressable>
      <Animated.Text className="bg-red my-2 text-center font-breathly-regular text-lg font-light text-slate-500">
        or
      </Animated.Text>
      <Pressable
        className="mb-20 w-72 max-w-xs items-center rounded-lg px-8 py-2 text-center"
        style={{ backgroundColor: colors.pastel["gray-light"] }}
        onPress={handleCustomizeButtonPress}
      >
        <Text className="py-1 text-lg text-slate-800">Customize the experience</Text>
      </Pressable>
    </Animated.View>
  );
};
